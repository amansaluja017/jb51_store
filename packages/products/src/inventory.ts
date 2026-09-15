import { db, product as productTable, productVariant as productVariantTable, inventry as inventryTable, inventryTransaction as inventryTransactionTable, customerDetails as customerDetailsTable, user as userTable, productStatus as productStatusTable } from '@repo/db';
import { eq, desc, and } from 'drizzle-orm';

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
      const [insertedCust] = await tx
        .insert(customerDetailsTable)
        .values({
          name: partyName,
          phoneNumber: input.phoneNumber?.trim() || null,
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
      let sellerUser = (
        await tx
          .select()
          .from(userTable)
          .where(
            and(
              eq(userTable.name, partyName),
              eq(userTable.role, 'seller')
            )
          )
      )[0];

      if (!sellerUser) {
        const sellerEmail = input.email?.trim().toLowerCase() || `seller_${Date.now()}_${Math.floor(Math.random() * 1000)}@internal.store`;
        const [createdSeller] = await tx
          .insert(userTable)
          .values({
            name: partyName,
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

export async function getInventoryTransactions(options?: { productId?: string; limit?: number }) {
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
      sellerName: userTable.name,
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
          tx.variantHex = (firstVar as any).hexCode || null;
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
