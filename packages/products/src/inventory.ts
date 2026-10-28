import { db, product as productTable, productVariant as productVariantTable, inventry as inventryTable, inventryTransaction as inventryTransactionTable, customerDetails as customerDetailsTable, user as userTable, productStatus as productStatusTable } from '@repo/db';
import { eq, desc, and } from 'drizzle-orm';
import { generateSlug } from './customers.js';
import { getProducts, matchesSlug, Product } from './data.js';

export interface RecordTransactionInput {
  productId: string;
  productVariantId?: string | null;
  type: 'sale' | 'purchase';
  quantity: number;
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  unitPrice?: number | null;
  totalAmount?: number | null;
}

export async function recordInventoryTransaction(input: RecordTransactionInput) {
  const quantity = Math.floor(Number(input.quantity));
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive integer');
  }

  const partyName = (input.name || '').trim();
  if (!partyName) {
    throw new Error(input.type === 'sale' ? 'Customer name is required' : 'Seller / Supplier name is required');
  }

  const [foundProduct] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, input.productId));

  if (!foundProduct) {
    throw new Error(`Product with ID ${input.productId} not found`);
  }

  let foundVariant: typeof productVariantTable.$inferSelect | undefined;
  if (input.productVariantId) {
    const [v] = await db
      .select()
      .from(productVariantTable)
      .where(
        and(
          eq(productVariantTable.id, input.productVariantId),
          eq(productVariantTable.productId, input.productId)
        )
      );
    if (!v) {
      throw new Error(`Variant with ID ${input.productVariantId} not found for this product`);
    }
    foundVariant = v;
  }

  return await db.transaction(async (tx) => {
    // Prevent duplicate deduction if already recorded (e.g. by orders.create backend transaction)
    if (input.notes && input.notes.startsWith('Invoice sale (')) {
      const [alreadyRecorded] = await tx
        .select()
        .from(inventryTransactionTable)
        .where(
          and(
            eq(inventryTransactionTable.productId, input.productId),
            eq(inventryTransactionTable.notes, input.notes.trim())
          )
        );
      if (alreadyRecorded) {
        return {
          success: true,
          transaction: alreadyRecorded,
          productName: foundProduct.name,
          variantName: foundVariant?.color || null,
        };
      }
    }

    // 1. Locate the inventory record
    let inventoryQuery = tx
      .select()
      .from(inventryTable)
      .where(
        input.productVariantId
          ? and(
              eq(inventryTable.productId, input.productId),
              eq(inventryTable.productVariant, input.productVariantId)
            )
          : eq(inventryTable.productId, input.productId)
      );

    const inventoryRows = await inventoryQuery;
    let invRow = inventoryRows.length > 0 ? inventoryRows[0] : null;

    let customerId: string | null = null;
    let userId: string | null = null;

    if (input.type === 'sale') {
      // Validate stock availability
      const currentAvail = invRow ? invRow.availableStock : 0;
      if (!invRow || currentAvail < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${currentAvail}, requested to sell: ${quantity}`
        );
      }

      // Deduct stock
      const newAvail = currentAvail - quantity;
      const newTotal = (invRow.totalStock || currentAvail) - quantity;
      await tx
        .update(inventryTable)
        .set({
          availableStock: newAvail,
          totalStock: Math.max(0, newTotal),
          updatedAt: new Date(),
        })
        .where(eq(inventryTable.id, invRow.id));

      // Record customer in customer_details table
      const partySlug = generateSlug(partyName);
      const [insertedCust] = await tx
        .insert(customerDetailsTable)
        .values({
          name: partyName,
          nameSlug: partySlug || 'customer',
          phoneNumber: input.phoneNumber?.trim() || 'N/A',
          email: input.email?.trim() || null,
          address: input.address?.trim() || null,
        })
        .returning();

      customerId = insertedCust.id;
    } else {
      // Purchase: Stock In
      if (invRow) {
        const newAvail = invRow.availableStock + quantity;
        const newTotal = invRow.totalStock + quantity;
        await tx
          .update(inventryTable)
          .set({
            availableStock: newAvail,
            totalStock: newTotal,
            updatedAt: new Date(),
          })
          .where(eq(inventryTable.id, invRow.id));
      } else {
        const [newInv] = await tx
          .insert(inventryTable)
          .values({
            productId: input.productId,
            productVariant: input.productVariantId || null,
            availableStock: quantity,
            reservedStock: 0,
            totalStock: quantity,
          })
          .returning();
        invRow = newInv;
      }

      // Store / find seller in user table with role 'seller'
      const sellerEmail = input.email?.trim().toLowerCase() || `seller_${generateSlug(partyName) || Date.now()}@internal.store`;
      let sellerUser = (
        await tx
          .select()
          .from(userTable)
          .where(
            and(
              eq(userTable.email, sellerEmail),
              eq(userTable.role, 'seller')
            )
          )
      )[0];

      if (!sellerUser) {
        const [createdSeller] = await tx
          .insert(userTable)
          .values({
            email: sellerEmail,
            password: 'INTERNAL_SELLER_NO_AUTH',
            role: 'seller',
          })
          .returning();
        sellerUser = createdSeller;
      }

      userId = sellerUser.id;
    }

    // 2. Synchronize productStatus inStock flag
    const allProdInv = await tx
      .select()
      .from(inventryTable)
      .where(eq(inventryTable.productId, input.productId));
    const totalAvail = allProdInv.reduce((sum, item) => sum + (item.availableStock || 0), 0);
    const inStock = totalAvail > 0;

    await tx
      .insert(productStatusTable)
      .values({
        productId: input.productId,
        status: 'listed',
        inStock,
      })
      .onConflictDoUpdate({
        target: productStatusTable.productId,
        set: { inStock, updatedAt: new Date() },
      });

    // 3. Insert transaction record
    const effectiveUnitPrice = input.unitPrice !== undefined && input.unitPrice !== null ? Number(input.unitPrice) : null;
    const effectiveTotal = input.totalAmount !== undefined && input.totalAmount !== null 
      ? Number(input.totalAmount) 
      : (effectiveUnitPrice !== null ? effectiveUnitPrice * quantity : null);

    const [createdTx] = await tx
      .insert(inventryTransactionTable)
      .values({
        productId: input.productId,
        productVariant: input.productVariantId || null,
        type: input.type,
        quantity,
        customerId,
        userId,
        unitPrice: effectiveUnitPrice !== null ? effectiveUnitPrice.toFixed(2) : null,
        totalAmount: effectiveTotal !== null ? effectiveTotal.toFixed(2) : null,
        notes: input.notes?.trim() || null,
      })
      .returning();

    return {
      success: true,
      transaction: createdTx,
      productName: foundProduct.name,
      variantName: foundVariant?.color || null,
      partyName,
      type: input.type,
      quantity,
      newTotalStock: totalAvail,
    };
  });
}

export async function getInventoryTransactions(options?: { productId?: string | null; limit?: number | null }) {
  const limit = Math.min(100, Math.max(1, options?.limit || 50));

  let query = db
    .select({
      id: inventryTransactionTable.id,
      productId: inventryTransactionTable.productId,
      productVariantId: inventryTransactionTable.productVariant,
      type: inventryTransactionTable.type,
      quantity: inventryTransactionTable.quantity,
      unitPrice: inventryTransactionTable.unitPrice,
      totalAmount: inventryTransactionTable.totalAmount,
      notes: inventryTransactionTable.notes,
      createdAt: inventryTransactionTable.createdAt,
      productName: productTable.name,
      variantColor: productVariantTable.color,
      variantHex: productVariantTable.hexCode,
      customerName: customerDetailsTable.name,
      customerPhone: customerDetailsTable.phoneNumber,
      customerEmail: customerDetailsTable.email,
      sellerName: userTable.email,
      sellerEmail: userTable.email,
    })
    .from(inventryTransactionTable)
    .leftJoin(productTable, eq(inventryTransactionTable.productId, productTable.id))
    .leftJoin(productVariantTable, eq(inventryTransactionTable.productVariant, productVariantTable.id))
    .leftJoin(customerDetailsTable, eq(inventryTransactionTable.customerId, customerDetailsTable.id))
    .leftJoin(userTable, eq(inventryTransactionTable.userId, userTable.id))
    .orderBy(desc(inventryTransactionTable.createdAt))
    .limit(limit);

  const txs = options?.productId
    ? await query.where(eq(inventryTransactionTable.productId, options.productId))
    : await query;

  // Retrieve current inventory records to attach available and reserved stock
  const allInventory = await db.select().from(inventryTable);
  const allVariants = await db.select().from(productVariantTable);

  return txs.map(tx => {
    let avail = 0;
    let reserved = 0;
    let total = 0;

    if (tx.productVariantId) {
      const inv = allInventory.find(
        i => i.productId === tx.productId && i.productVariant === tx.productVariantId
      );
      if (inv) {
        avail = inv.availableStock ?? 0;
        reserved = inv.reservedStock ?? 0;
        total = inv.totalStock ?? 0;
      }
    } else if (tx.productId) {
      const prodInvs = allInventory.filter(i => i.productId === tx.productId);
      avail = prodInvs.reduce((sum, i) => sum + (i.availableStock || 0), 0);
      reserved = prodInvs.reduce((sum, i) => sum + (i.reservedStock || 0), 0);
      total = prodInvs.reduce((sum, i) => sum + (i.totalStock || 0), 0);

      if (!tx.variantColor) {
        const firstVar = allVariants.find(v => v.productId === tx.productId);
        if (firstVar) {
          tx.variantColor = firstVar.color;
          tx.variantHex = firstVar.hexCode || null;
        }
      }
    }

    return {
      ...tx,
      availableStock: avail,
      reservedStock: reserved,
      totalStock: total,
    };
  });
}

export interface GetPaginatedInventoryInput {
  search?: string | null;
  category?: string | null;
  stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved' | null;
  sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc' | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedInventory(input?: GetPaginatedInventoryInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 8);
  const search = (input?.search || '').trim().toLowerCase();
  const category = (input?.category || 'All').trim();
  const stockFilter = input?.stockFilter || 'all';
  const sortBy = input?.sortBy || 'default';

  const allProducts = await getProducts();

  const LOW_STOCK_THRESHOLD = 5;

  let inStockProducts = 0;
  let outOfStockProducts = 0;
  let lowStockProducts = 0;
  let hasReservedProducts = 0;
  let totalStockUnits = 0;
  let totalReservedUnits = 0;

  allProducts.forEach((p) => {
    const variants = p.variants || [];
    const prodStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const prodReserved = variants.reduce((acc, v) => acc + (Number(v.reservedStock) || 0), 0);
    const isInStock = p.inStock !== false && prodStock > 0;

    if (isInStock) {
      inStockProducts++;
    } else {
      outOfStockProducts++;
    }

    if (prodReserved > 0) {
      hasReservedProducts++;
    }

    if (isInStock && prodStock > 0 && prodStock <= LOW_STOCK_THRESHOLD) {
      lowStockProducts++;
    }

    totalStockUnits += prodStock;
    totalReservedUnits += prodReserved;
  });

  const metrics = {
    totalProducts: allProducts.length,
    inStockProducts,
    outOfStockProducts,
    lowStockProducts,
    hasReservedProducts,
    totalStockUnits,
    totalReservedUnits,
  };

  let list = allProducts.filter((product) => {
    const matchesSearch =
      !search ||
      (product.name && product.name.toLowerCase().includes(search)) ||
      (product.category && product.category.toLowerCase().includes(search)) ||
      (product.slug && product.slug.toLowerCase().includes(search)) ||
      (product.variants || []).some(
        (v) => v.color && v.color.toLowerCase().includes(search)
      );

    const matchesCategory =
      category === 'All' ||
      (product.category && product.category.toLowerCase() === category.toLowerCase());

    if (!matchesSearch || !matchesCategory) return false;

    const variants = product.variants || [];
    const prodStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const prodReserved = variants.reduce((acc, v) => acc + (Number(v.reservedStock) || 0), 0);
    const isInStock = product.inStock !== false && prodStock > 0;

    if (stockFilter === 'inStock') {
      return isInStock;
    }
    if (stockFilter === 'outOfStock') {
      return !isInStock;
    }
    if (stockFilter === 'lowStock') {
      return isInStock && prodStock > 0 && prodStock <= LOW_STOCK_THRESHOLD;
    }
    if (stockFilter === 'reserved') {
      return prodReserved > 0;
    }
    return true;
  });

  const getProductStock = (p: Product) => {
    return (p.variants || []).reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  };

  list.sort((a, b) => {
    if (sortBy === 'stock-asc') {
      return getProductStock(a) - getProductStock(b);
    }
    if (sortBy === 'stock-desc') {
      return getProductStock(b) - getProductStock(a);
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' });
    }
    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '', 'en', { sensitivity: 'base' });
    }
    return 0;
  });

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  const items = list.slice(offset, offset + limit);

  return {
    items,
    total,
    page: safePage,
    limit,
    totalPages,
    metrics,
  };
}

export interface UpdateInventoryVariantItem {
  id?: string | null;
  productVariantId?: string | null;
  color?: string | null;
  size?: string | null;
  stock: number;
  reservedStock?: number | null;
}

export interface UpdateInventoryInput {
  productId?: string | null;
  slug?: string | null;
  status?: 'listed' | 'unListed' | 'discontinued' | null;
  variants?: UpdateInventoryVariantItem[] | null;
  forceInStock?: boolean | null;
}

export async function updateInventory(input: UpdateInventoryInput) {
  if (!input.productId && !input.slug) {
    throw new Error('Either productId or slug must be provided to update inventory');
  }

  let foundProduct: typeof productTable.$inferSelect | undefined;
  if (input.productId) {
    const [p] = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, input.productId));
    foundProduct = p;
  }
  if (!foundProduct && input.slug) {
    const dbProducts = await db.select().from(productTable);
    foundProduct = dbProducts.find((r) => matchesSlug(r, input.slug!));
  }

  if (!foundProduct) {
    throw new Error(`Product not found with identifier ${input.productId || input.slug}`);
  }

  return await db.transaction(async (tx) => {
    // 1. Fetch existing variants and inventory
    const existingDbVariants = await tx
      .select()
      .from(productVariantTable)
      .where(eq(productVariantTable.productId, foundProduct!.id));

    const existingInventory = await tx
      .select()
      .from(inventryTable)
      .where(eq(inventryTable.productId, foundProduct!.id));

    const invByVariant = new Map(
      existingInventory.map((inv) => [inv.productVariant, inv])
    );

    // 2. Process each variant stock update if provided
    if (input.variants && Array.isArray(input.variants) && input.variants.length > 0) {
      for (const vInput of input.variants) {
        const targetVariantId = vInput.productVariantId || vInput.id;
        let variantRow = existingDbVariants.find(
          (v) => (targetVariantId && v.id === targetVariantId) ||
                 (vInput.color && v.color && v.color.toLowerCase() === vInput.color.toLowerCase())
        );

        // If variant doesn't exist yet in productVariantTable, create it
        if (!variantRow && vInput.color) {
          const [newV] = await tx
            .insert(productVariantTable)
            .values({
              productId: foundProduct!.id,
              color: vInput.color.trim(),
            })
            .returning();
          variantRow = newV;
        }

        const variantId = variantRow ? variantRow.id : (targetVariantId || null);
        const newAvail = Math.max(0, Math.floor(Number(vInput.stock) || 0));
        const existingInv = variantId
          ? invByVariant.get(variantId)
          : (existingInventory.length === 1 ? existingInventory[0] : null);

        const newReserved = vInput.reservedStock !== undefined && vInput.reservedStock !== null
          ? Math.max(0, Math.floor(Number(vInput.reservedStock) || 0))
          : (existingInv ? existingInv.reservedStock : 0);

        if (existingInv) {
          await tx
            .update(inventryTable)
            .set({
              availableStock: newAvail,
              reservedStock: newReserved,
              totalStock: newAvail + newReserved,
              updatedAt: new Date(),
            })
            .where(eq(inventryTable.id, existingInv.id));
        } else {
          await tx
            .insert(inventryTable)
            .values({
              productId: foundProduct!.id,
              productVariant: variantId,
              availableStock: newAvail,
              reservedStock: newReserved,
              totalStock: newAvail + newReserved,
            });
        }
      }
    }

    // 3. Compute total available and reserved stock across all inventory rows
    const allProdInv = await tx
      .select()
      .from(inventryTable)
      .where(eq(inventryTable.productId, foundProduct!.id));

    const totalAvail = allProdInv.reduce((sum, item) => sum + (item.availableStock || 0), 0);
    const totalReserved = allProdInv.reduce((sum, item) => sum + (item.reservedStock || 0), 0);

    const isInStock = input.forceInStock !== undefined && input.forceInStock !== null
      ? Boolean(input.forceInStock)
      : totalAvail > 0;

    // 4. Synchronize productStatusTable
    const [existingStatus] = await tx
      .select()
      .from(productStatusTable)
      .where(eq(productStatusTable.productId, foundProduct!.id));

    const finalStatus = input.status || (existingStatus ? existingStatus.status : 'listed');

    await tx
      .insert(productStatusTable)
      .values({
        productId: foundProduct!.id,
        status: finalStatus,
        inStock: isInStock,
      })
      .onConflictDoUpdate({
        target: productStatusTable.productId,
        set: {
          inStock: isInStock,
          ...(input.status ? { status: input.status } : {}),
          updatedAt: new Date(),
        },
      });

    // If status was updated, keep productTable.features.isListed in sync
    if (input.status) {
      const isListed = input.status === 'listed';
      const curFeat = (foundProduct!.features as Record<string, unknown>) || {};
      await tx
        .update(productTable)
        .set({
          features: { ...curFeat, isListed },
          updatedAt: new Date(),
        })
        .where(eq(productTable.id, foundProduct!.id));
    }

    // 5. Synchronize productTable.features.variants (fallback / cache)
    if (input.variants && Array.isArray(input.variants) && input.variants.length > 0) {
      const currentFeat = (foundProduct!.features as Record<string, unknown>) || {};
      if (currentFeat.variants && Array.isArray(currentFeat.variants)) {
        const rawVariants = currentFeat.variants as Array<Record<string, unknown>>;
        const updatedFeatVariants = rawVariants.map((fv) => {
          const matching = input.variants!.find(
            (iv) => (iv.id && iv.id === fv.id) ||
                    (iv.productVariantId && iv.productVariantId === fv.id) ||
                    (iv.color && typeof fv.color === 'string' && iv.color.toLowerCase() === fv.color.toLowerCase())
          );
          if (matching) {
            return {
              ...fv,
              stock: Math.max(0, Math.floor(Number(matching.stock) || 0)),
              ...(matching.reservedStock !== undefined && matching.reservedStock !== null
                ? { reservedStock: Math.max(0, Math.floor(Number(matching.reservedStock) || 0)) }
                : {})
            };
          }
          return fv;
        });

        await tx
          .update(productTable)
          .set({
            features: {
              ...currentFeat,
              variants: updatedFeatVariants,
            },
            updatedAt: new Date(),
          })
          .where(eq(productTable.id, foundProduct!.id));
      }
    }

    return {
      success: true,
      productId: foundProduct!.id,
      totalStock: totalAvail,
      totalReserved,
      inStock: isInStock,
      status: finalStatus,
      isListed: finalStatus === 'listed',
    };
  });
}

