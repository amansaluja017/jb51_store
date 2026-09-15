import {
  db,
  product as productTable,
  productStatus as productStatusTable,
  category as categoryTable,
  productVariant as productVariantTable,
  productImages as productImagesTable,
  inventry as inventryTable,
  inventryTransaction as inventryTransactionTable
} from '@repo/db';
import { eq, inArray, asc, and } from 'drizzle-orm';

export interface ProductVariant {
  id?: string;
  color: string;
  hexCode?: string;
  stock: number;
  reservedStock?: number;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  mrp?: number;
  sellingPrice?: number;
  price: number;
  discountPrice?: number;
  category: string;
  categoryId?: string;
  images: string[];
  fabric: string;
  fit: string;
  careInstructions: string;
  variants: ProductVariant[];
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  createdAt: string;
  tags?: string[];
  isListed?: boolean;
  status?: 'listed' | 'unListed' | 'discontinued';
  inStock?: boolean;
}

export const CATEGORIES = [
  'Formal Suits',
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear'
];

export async function getCategories(): Promise<string[]> {
  try {
    const dbCategories = await db.select().from(categoryTable);
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map(c => c.name);
    }
  } catch (err) {
    console.log('[DB getCategories Notice]:', err instanceof Error ? err.message : err);
  }
  return [];
}

function matchesSlug(row: any, slug: string): boolean {
  const feat = (row.features as Record<string, any>) || {};
  const normSlug = slug.toLowerCase();
  const rowSlug = (feat.slug || '').toLowerCase();
  const nameSlug = (row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return rowSlug === normSlug || nameSlug === normSlug;
}

function mapDbToProduct(row: any): Product {
  const features = (row.features as Record<string, any>) || {};
  const mrp = Number(row.mrp || features.mrp || 0);
  const sellingPrice = Number(row.sellingPrice || features.sellingPrice || mrp);
  const price = sellingPrice || mrp;
  const discountPrice = mrp > sellingPrice ? sellingPrice : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: features.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: row.description || '',
    mrp,
    sellingPrice,
    price,
    discountPrice,
    category: features.category || 'Uncategorized',
    categoryId: row.categoryId || features.categoryId,
    images: features.images || [],
    fabric: features.fabric || '',
    fit: features.fit || '',
    careInstructions: features.careInstructions || '',
    variants: (features.variants || []).map((v: any) => ({
      id: v.id,
      color: v.color,
      hexCode: v.hexCode || undefined,
      stock: v.stock,
      reservedStock: v.reservedStock,
      images: v.images,
    })),
    featured: row.isFeatured ?? false,
    newArrival: row.isLatest ?? false,
    bestseller: row.isBestSeller ?? false,
    isListed: features.isListed !== false,
    tags: (row.tags as string[]) || [],
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  };
}

async function upsertProductStatus(
  productId: string,
  updates: { status?: 'listed' | 'unListed' | 'discontinued'; inStock?: boolean },
  executor: any = db
) {
  const existing = await executor
    .select()
    .from(productStatusTable)
    .where(eq(productStatusTable.productId, productId));

  if (existing && existing.length > 0) {
    const current = existing[0];
    const newStatus = updates.status !== undefined ? updates.status : current.status;
    const newInStock = updates.inStock !== undefined ? updates.inStock : current.inStock;

    const [updated] = await executor
      .update(productStatusTable)
      .set({
        status: newStatus,
        inStock: newInStock,
      })
      .where(eq(productStatusTable.productId, productId))
      .returning();
    return updated;
  } else {
    const [inserted] = await executor
      .insert(productStatusTable)
      .values({
        productId,
        status: updates.status || 'listed',
        inStock: updates.inStock !== undefined ? updates.inStock : true,
      })
      .returning();
    return inserted;
  }
}

export async function getProducts(includeDiscontinued = false): Promise<Product[]> {
  try {
    const dbProducts = await db.select().from(productTable);
    const dbStatuses = await db.select().from(productStatusTable);
    const dbCategories = await db.select().from(categoryTable);
    const dbImages = await db.select().from(productImagesTable);
    const dbInventory = await db.select().from(inventryTable);
    const dbVariants = await db.select().from(productVariantTable);

    const statusMap = new Map(dbStatuses.map(s => [s.productId, s]));
    const categoryMap = new Map(dbCategories.map(c => [c.id, c.name]));
    const imagesMap = new Map<string, string[]>();
    for (const img of dbImages) {
      if (img.productId && img.url) {
        if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
        imagesMap.get(img.productId)!.push(img.url);
      }
    }

    if (dbProducts && dbProducts.length > 0) {
      const mapped = dbProducts
        .filter((r: any) => {
          if (includeDiscontinued) return true;
          const feat = (r.features as Record<string, any>) || {};
          // Hard-exclude anything flagged as discontinued in features (soft-delete)
          if (feat.isDiscontinued) return false;
          const status = statusMap.get(r.id);
          // Exclude if status table explicitly marks as discontinued
          if (status?.status === 'discontinued') return false;
          // Include everything else (listed or unlisted — admin can see unlisted)
          return true;
        })
        .map((r: any) => {
          const feat = (r.features as Record<string, any>) || {};
          const prod = mapDbToProduct(r);
          if (r.categoryId && categoryMap.has(r.categoryId)) {
            prod.category = categoryMap.get(r.categoryId)!;
          }
          if ((!prod.images || prod.images.length === 0) && imagesMap.has(r.id)) {
            prod.images = imagesMap.get(r.id)!;
          }

          // Take available and reserved stock from inventry table
          const prodVariants = dbVariants.filter(v => v.productId === r.id);
          const prodInventory = dbInventory.filter(inv => inv.productId === r.id);
          const inventoryByVariant = new Map(prodInventory.map(inv => [inv.productVariant, inv]));

          if (prodVariants && prodVariants.length > 0) {
            prod.variants = prodVariants.map(v => {
              const inv = inventoryByVariant.get(v.id);
              const variantImgs = dbImages
                .filter(img => img.productId === r.id && img.productVariantId === v.id)
                .map(img => img.url);
              return {
                id: v.id,
                color: v.color,
                hexCode: (v as any).hexCode || undefined,
                stock: inv ? inv.availableStock : 0,
                reservedStock: inv ? inv.reservedStock : 0,
                images: variantImgs.length > 0 ? variantImgs : (prod.images || []),
              };
            });
          } else if (prod.variants && prod.variants.length > 0) {
            prod.variants = prod.variants.map((v: any) => {
              const inv = inventoryByVariant.get(v.id) || (prodInventory.length === 1 ? prodInventory[0] : undefined);
              return {
                ...v,
                stock: inv ? inv.availableStock : (v.stock ?? 0),
                reservedStock: inv ? inv.reservedStock : (v.reservedStock ?? 0),
              };
            });
          }

          const status = statusMap.get(r.id);
          if (status) {
            prod.isListed = status.status === 'listed';
            prod.status = status.status;
            prod.inStock = status.inStock ?? true;
          } else {
            prod.isListed = feat.isListed !== false && !feat.isDiscontinued;
            prod.status = prod.isListed ? 'listed' : 'unListed';
            prod.inStock = true;
          }
          return prod;
        });
      return mapped;
    }
  } catch (err) {
    console.log('[DB getProducts Notice]:', err instanceof Error ? err.message : err);
  }
  return [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const dbProducts = await db.select().from(productTable);
    const matchingRows = dbProducts.filter((r: any) => matchesSlug(r, slug));
    if (matchingRows.length === 0) return null;

    const targetRow = matchingRows.find((r: any) => !(r.features as any)?.isDiscontinued) || matchingRows[matchingRows.length - 1];
    const feat = (targetRow.features as Record<string, any>) || {};
    if (feat.isDiscontinued) return null;

    const statusRow = await db.select().from(productStatusTable).where(eq(productStatusTable.productId, targetRow.id));
    if (statusRow && statusRow.length > 0 && statusRow[0].status === 'discontinued') {
      return null;
    }

    const prod = mapDbToProduct(targetRow);

    // Populate actual relational category if available
    if (targetRow.categoryId) {
      const [cat] = await db.select().from(categoryTable).where(eq(categoryTable.id, targetRow.categoryId));
      if (cat) {
        prod.category = cat.name;
        prod.categoryId = cat.id;
      }
    }

    // Populate relational images if available
    const relationalImages = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, targetRow.id))
      .orderBy(asc(productImagesTable.orderIndex));
    if (relationalImages && relationalImages.length > 0) {
      const mainUrls = relationalImages
        .filter(img => !img.productVariantId)
        .map(img => img.url);
      if (mainUrls.length > 0) {
        prod.images = mainUrls;
      } else {
        prod.images = relationalImages.map(img => img.url);
      }
    }

    // Populate relational variants and inventory if available
    const relationalVariants = await db
      .select()
      .from(productVariantTable)
      .where(eq(productVariantTable.productId, targetRow.id));

    if (relationalVariants && relationalVariants.length > 0) {
      const inventoryRows = await db
        .select()
        .from(inventryTable)
        .where(eq(inventryTable.productId, targetRow.id));
      const inventoryByVariant = new Map(inventoryRows.map(inv => [inv.productVariant, inv]));

      prod.variants = relationalVariants.map(v => {
        const inv = inventoryByVariant.get(v.id);
        const variantImgs = relationalImages
          .filter(img => img.productVariantId === v.id)
          .map(img => img.url);
        return {
          id: v.id,
          color: v.color,
          hexCode: (v as any).hexCode || undefined,
          stock: inv ? inv.availableStock : 0,
          reservedStock: inv ? inv.reservedStock : 0,
          images: variantImgs,
        };
      });
    }

    if (statusRow && statusRow.length > 0) {
      prod.isListed = statusRow[0].status === 'listed';
      (prod as any).inStock = statusRow[0].inStock ?? true;
    }
    return prod;
  } catch (err) {
    console.log('[DB getProductBySlug Notice]:', err instanceof Error ? err.message : err);
  }
  return null;
}

export async function createProduct(productInput: Partial<Product> & { name: string; slug: string; price?: number; mrp?: number; sellingPrice?: number }): Promise<Product> {
  const name = (productInput.name || '').trim();
  const slug = (productInput.slug || '').trim();
  const description = (productInput.description || '').trim();
  const mrp = Number(productInput.mrp || productInput.price);
  const sellingPrice = Number(productInput.sellingPrice || productInput.price || mrp);

  if (!name) throw new Error('Product name is required');
  if (!slug) throw new Error('Product slug is required');
  if (!description) throw new Error('Product description is mandatory for creating the product');
  if (isNaN(mrp) || mrp <= 0) throw new Error('Product MRP must be greater than 0');
  if (isNaN(sellingPrice) || sellingPrice <= 0) throw new Error('Product selling price must be greater than 0');

  // Images validation: at least 2 images mandatory
  const rawImages = (productInput.images || []).map(i => i.trim()).filter(i => i !== '');
  const variantImages = (productInput.variants || []).flatMap(v => (v.images || []).map(img => img.trim()).filter(img => img !== ''));
  const allImages = Array.from(new Set([...rawImages, ...variantImages]));
  if (allImages.length < 2) {
    throw new Error('At least 2 product images are mandatory for creating the product');
  }

  // Variants and stock validation: stock mandatory
  const rawVariants = productInput.variants && productInput.variants.length > 0
    ? productInput.variants
    : [{ color: 'Standard', stock: 0 }];

  // Verify stock is valid for all variants
  for (const v of rawVariants) {
    if (v.stock === undefined || v.stock === null || isNaN(Number(v.stock)) || Number(v.stock) < 0) {
      throw new Error(`Stock is mandatory and must be 0 or greater (variant "${v.color || 'Standard'}")`);
    }
  }

  // Execute atomic transaction across:
  // 1. category
  // 2. product
  // 3. product_variant
  // 4. product_images
  // 5. product_status
  // 6. inventry
  const createdFromDb = await db.transaction(async (tx: any) => {
    // 1. Category resolution
    let resolvedCategoryId: string | null = productInput.categoryId || null;
    let resolvedCategoryName: string = (productInput.category || '').trim();

    if (resolvedCategoryId) {
      const [existingCat] = await tx
        .select()
        .from(categoryTable)
        .where(eq(categoryTable.id, resolvedCategoryId));
      if (existingCat) {
        resolvedCategoryName = existingCat.name;
      } else {
        resolvedCategoryId = null; // will resolve by name
      }
    }

    if (!resolvedCategoryId) {
      if (!resolvedCategoryName) {
        resolvedCategoryName = 'Uncategorized';
      }
      const [existingCatByName] = await tx
        .select()
        .from(categoryTable)
        .where(eq(categoryTable.name, resolvedCategoryName));
      if (existingCatByName) {
        resolvedCategoryId = existingCatByName.id;
      } else {
        const [insertedCat] = await tx
          .insert(categoryTable)
          .values({ name: resolvedCategoryName })
          .returning();
        resolvedCategoryId = insertedCat.id;
      }
    }

    if (!resolvedCategoryId) {
      throw new Error('Valid categoryId is mandatory for creating the product');
    }

    // 2. Insert into product table
    const [insertedProduct] = await tx
      .insert(productTable)
      .values({
        name,
        description,
        mrp: mrp.toString(),
        sellingPrice: sellingPrice.toString(),
        categoryId: resolvedCategoryId,
        isBestSeller: productInput.bestseller || false,
        isLatest: productInput.newArrival || false,
        isFeatured: productInput.featured || false,
        tags: productInput.tags || [],
        features: {
          slug,
          mrp,
          sellingPrice,
          category: resolvedCategoryName,
          categoryId: resolvedCategoryId,
          images: allImages,
          fabric: productInput.fabric || '',
          fit: productInput.fit || '',
          careInstructions: productInput.careInstructions || '',
          variants: rawVariants,
          isListed: productInput.isListed !== false,
        },
      })
      .returning();

    if (!insertedProduct) {
      throw new Error('Failed to insert product record');
    }

    // 3. Insert product variants & 6. Insert inventory
    const createdVariants: ProductVariant[] = [];
    let totalStockAcrossVariants = 0;

    for (const v of rawVariants) {
      const variantColor = (v.color || 'Standard').trim();
      const variantHex = (v.hexCode || '').trim() || null;
      const variantStock = Math.max(0, Math.floor(Number(v.stock) || 0));
      const variantReservedStock = Math.max(0, Math.floor(Number(v.reservedStock) || 0));
      totalStockAcrossVariants += variantStock;

      const [insertedVariant] = await tx
        .insert(productVariantTable)
        .values({
          productId: insertedProduct.id,
          color: variantColor,
          hexCode: variantHex,
        })
        .returning();

      // 6. Insert into inventry
      await tx.insert(inventryTable).values({
        productId: insertedProduct.id,
        productVariant: insertedVariant.id,
        availableStock: variantStock,
        reservedStock: variantReservedStock,
        totalStock: variantStock + variantReservedStock,
      });

      // Insert variant-specific images if any
      const variantSpecificImages = (v.images || []).map(img => img.trim()).filter(img => img !== '');
      for (let order = 0; order < variantSpecificImages.length; order++) {
        await tx.insert(productImagesTable).values({
          productId: insertedProduct.id,
          productVariantId: insertedVariant.id,
          url: variantSpecificImages[order],
          orderIndex: order,
        });
      }

      createdVariants.push({
        id: insertedVariant.id,
        color: variantColor,
        hexCode: variantHex || undefined,
        stock: variantStock,
        reservedStock: variantReservedStock,
        images: variantSpecificImages,
      });
    }

    // 4. Insert main product images (at least 2 images)
    for (let order = 0; order < allImages.length; order++) {
      await tx.insert(productImagesTable).values({
        productId: insertedProduct.id,
        productVariantId: null,
        url: allImages[order],
        orderIndex: order,
      });
    }

    // 5. Insert product status
    const initialStatus = productInput.isListed !== false ? 'listed' : 'unListed';
    const hasStock = totalStockAcrossVariants > 0;
    await tx
      .insert(productStatusTable)
      .values({
        productId: insertedProduct.id,
        status: initialStatus,
        inStock: hasStock,
      })
      .onConflictDoUpdate({
        target: productStatusTable.productId,
        set: { status: initialStatus, inStock: hasStock },
      });

    const result = mapDbToProduct(insertedProduct);
    result.category = resolvedCategoryName;
    result.categoryId = resolvedCategoryId;
    result.images = allImages;
    result.variants = createdVariants;
    result.isListed = initialStatus === 'listed';
    (result as any).inStock = hasStock;
    return result;
  });

  return createdFromDb;
}

export async function updateProduct(slug: string, updatedData: Partial<Product>): Promise<Product | null> {
  try {
    const dbProducts = await db.select().from(productTable);
    const targetRow = dbProducts.find((r: any) => matchesSlug(r, slug));

    if (targetRow) {
      const currentFeat = (targetRow.features as Record<string, any>) || {};
      const priceFallback = updatedData.price !== undefined ? updatedData.price : undefined;
      const updatedFeat = {
        ...currentFeat,
        slug: updatedData.slug !== undefined ? updatedData.slug : (currentFeat.slug || slug),
        category: updatedData.category !== undefined ? updatedData.category : currentFeat.category,
        images: updatedData.images !== undefined ? updatedData.images : currentFeat.images,
        fabric: updatedData.fabric !== undefined ? updatedData.fabric : currentFeat.fabric,
        fit: updatedData.fit !== undefined ? updatedData.fit : currentFeat.fit,
        careInstructions: updatedData.careInstructions !== undefined ? updatedData.careInstructions : currentFeat.careInstructions,
        variants: updatedData.variants !== undefined ? updatedData.variants : currentFeat.variants,
        isListed: updatedData.isListed !== undefined ? updatedData.isListed : currentFeat.isListed,
        mrp: updatedData.mrp !== undefined ? updatedData.mrp : (priceFallback !== undefined ? priceFallback : currentFeat.mrp),
        sellingPrice: updatedData.sellingPrice !== undefined ? updatedData.sellingPrice : (priceFallback !== undefined ? priceFallback : currentFeat.sellingPrice),
      };

      return await db.transaction(async (tx: any) => {
        let resolvedCategoryId: string | undefined = undefined;
        if (updatedData.categoryId) {
          resolvedCategoryId = updatedData.categoryId;
        } else if (updatedData.category) {
          const [existingCat] = await tx
            .select()
            .from(categoryTable)
            .where(eq(categoryTable.name, updatedData.category.trim()));
          if (existingCat) {
            resolvedCategoryId = existingCat.id;
          } else {
            const [insertedCat] = await tx
              .insert(categoryTable)
              .values({ name: updatedData.category.trim() })
              .returning();
            resolvedCategoryId = insertedCat.id;
          }
        }

        const effectiveMrp = updatedData.mrp !== undefined ? updatedData.mrp : (priceFallback !== undefined ? priceFallback : targetRow.mrp);
        const effectiveSellingPrice = updatedData.sellingPrice !== undefined ? updatedData.sellingPrice : (priceFallback !== undefined ? priceFallback : targetRow.sellingPrice);

        const [updatedRow] = await tx
          .update(productTable)
          .set({
            name: updatedData.name !== undefined ? updatedData.name : targetRow.name,
            description: updatedData.description !== undefined ? updatedData.description : targetRow.description,
            mrp: effectiveMrp !== undefined ? effectiveMrp.toString() : targetRow.mrp,
            sellingPrice: effectiveSellingPrice !== undefined ? effectiveSellingPrice.toString() : targetRow.sellingPrice,
            isBestSeller: updatedData.bestseller !== undefined ? updatedData.bestseller : targetRow.isBestSeller,
            isLatest: updatedData.newArrival !== undefined ? updatedData.newArrival : targetRow.isLatest,
            isFeatured: updatedData.featured !== undefined ? updatedData.featured : targetRow.isFeatured,
            tags: updatedData.tags !== undefined ? updatedData.tags : (targetRow.tags as string[]),
            features: updatedFeat,
            ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
          })
          .where(eq(productTable.id, targetRow.id))
          .returning();

        // Synchronize variants, inventry table, and log transactions
        if (updatedData.variants && Array.isArray(updatedData.variants)) {
          let totalAvailStock = 0;
          for (const v of updatedData.variants) {
            const avail = Math.max(0, Number(v.stock) || 0);
            const reserved = Math.max(0, Number(v.reservedStock) || 0);
            const total = avail + reserved;
            totalAvailStock += avail;

            let variantId = v.id;
            if (!variantId) {
              const [existingV] = await tx
                .select()
                .from(productVariantTable)
                .where(
                  and(
                    eq(productVariantTable.productId, targetRow.id),
                    eq(productVariantTable.color, v.color)
                  )
                );
              if (existingV) {
                variantId = existingV.id;
              } else {
                const [newV] = await tx
                  .insert(productVariantTable)
                  .values({
                    productId: targetRow.id,
                    color: v.color,
                    hexCode: v.hexCode || null,
                  })
                  .returning();
                variantId = newV.id;
              }
            }

            const invRows = await tx
              .select()
              .from(inventryTable)
              .where(
                variantId
                  ? and(
                      eq(inventryTable.productId, targetRow.id),
                      eq(inventryTable.productVariant, variantId)
                    )
                  : eq(inventryTable.productId, targetRow.id)
              );

            const prevInv = invRows.length > 0 ? invRows[0] : null;
            const prevAvail = prevInv ? prevInv.availableStock : 0;
            const prevReserved = prevInv ? prevInv.reservedStock : 0;

            if (prevInv) {
              await tx
                .update(inventryTable)
                .set({
                  availableStock: avail,
                  reservedStock: reserved,
                  totalStock: total,
                  updatedAt: new Date(),
                })
                .where(eq(inventryTable.id, prevInv.id));
            } else {
              await tx.insert(inventryTable).values({
                productId: targetRow.id,
                productVariant: variantId || null,
                availableStock: avail,
                reservedStock: reserved,
                totalStock: total,
              });
            }

            // If stock changed, record transaction history log
            if (prevAvail !== avail || prevReserved !== reserved) {
              const diffAvail = avail - prevAvail;
              const diffReserved = reserved - prevReserved;
              const note = `Inventory update for ${v.color || 'item'}: Available ${prevAvail} -> ${avail} (${diffAvail >= 0 ? '+' : ''}${diffAvail}), Reserved ${prevReserved} -> ${reserved} (${diffReserved >= 0 ? '+' : ''}${diffReserved})`;

              await tx.insert(inventryTransactionTable).values({
                productId: targetRow.id,
                productVariant: variantId || null,
                type: 'adjustment',
                quantity: Math.abs(diffAvail) || Math.abs(diffReserved) || 1,
                notes: note,
              });
            }
          }

          const inStock = updatedData.inStock !== undefined ? updatedData.inStock : totalAvailStock > 0;
          await upsertProductStatus(targetRow.id, { inStock }, tx);
        }

        if (updatedRow) {
          if (updatedData.isListed !== undefined) {
            const statusVal = updatedData.isListed ? 'listed' : 'unListed';
            await upsertProductStatus(updatedRow.id, { status: statusVal }, tx);
          }
          return mapDbToProduct(updatedRow);
        }
        return null;
      });
    }
  } catch (err) {
    console.error('[DB Product Update Notice]:', err instanceof Error ? err.message : err);
  }

  return null;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  try {
    const dbProducts = await db.select().from(productTable);
    const matchingRows = dbProducts.filter((r: any) => matchesSlug(r, slug));

    if (matchingRows.length > 0) {
      await db.transaction(async (tx: any) => {
        for (const targetRow of matchingRows) {
          await upsertProductStatus(targetRow.id, { status: 'discontinued' }, tx);

          const currentFeat = (targetRow.features as Record<string, any>) || {};
          await tx
            .update(productTable)
            .set({
              features: { ...currentFeat, isListed: false, isDiscontinued: true },
            })
            .where(eq(productTable.id, targetRow.id));
        }
      });
      return true;
    }
  } catch (err) {
    console.error('[DB Product Delete Notice]:', err instanceof Error ? err.message : err);
  }

  return false;
}

export async function getProductStatus(slug: string): Promise<{ productId: string; status: 'listed' | 'unListed' | 'discontinued'; inStock: boolean; updatedAt?: string } | null> {
  try {
    const dbProducts = await db.select().from(productTable);
    const matching = dbProducts.filter((r: any) => matchesSlug(r, slug));
    const targetRow = matching.find((r: any) => !(r.features as any)?.isDiscontinued) || (matching.length > 0 ? matching[matching.length - 1] : undefined);

    if (targetRow) {
      const statuses = await db.select().from(productStatusTable).where(eq(productStatusTable.productId, targetRow.id));
      if (statuses && statuses.length > 0) {
        const latest = statuses[0];
        return {
          productId: latest.productId,
          status: latest.status as 'listed' | 'unListed' | 'discontinued',
          inStock: latest.inStock ?? true,
          updatedAt: latest.updatedAt ? new Date(latest.updatedAt).toISOString() : undefined,
        };
      }
    }
  } catch (err) {
    console.log('[DB getProductStatus Notice]:', err instanceof Error ? err.message : err);
  }

  return null;
}

export async function updateProductStatus(
  slug: string,
  updates: { status?: 'listed' | 'unListed' | 'discontinued'; inStock?: boolean }
): Promise<{ productId: string; status: 'listed' | 'unListed' | 'discontinued'; inStock: boolean; updatedAt?: string } | null> {
  try {
    const dbProducts = await db.select().from(productTable);
    const matching = dbProducts.filter((r: any) => matchesSlug(r, slug));
    const targetRow = matching.find((r: any) => !(r.features as any)?.isDiscontinued) || (matching.length > 0 ? matching[matching.length - 1] : undefined);

    if (targetRow) {
      return await db.transaction(async (tx: any) => {
        if (updates.status !== undefined) {
          const isListed = updates.status === 'listed';
          const currentFeat = (targetRow.features as Record<string, any>) || {};
          await tx
            .update(productTable)
            .set({
              features: { ...currentFeat, isListed },
            })
            .where(eq(productTable.id, targetRow.id));
        }

        const statusRow = await upsertProductStatus(targetRow.id, updates, tx);
        if (statusRow) {
          return {
            productId: statusRow.productId,
            status: statusRow.status as 'listed' | 'unListed' | 'discontinued',
            inStock: statusRow.inStock ?? true,
            updatedAt: statusRow.updatedAt ? new Date(statusRow.updatedAt).toISOString() : undefined,
          };
        }
        return null;
      });
    }
  } catch (err) {
    console.error('[DB updateProductStatus Notice]:', err instanceof Error ? err.message : err);
  }

  return null;
}
