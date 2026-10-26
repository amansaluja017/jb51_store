import {
  db,
  product as productTable,
  productStatus as productStatusTable,
  category as categoryTable,
  productVariant as productVariantTable,
  productImages as productImagesTable,
  inventry as inventryTable
} from '@repo/db';
import { eq, asc, sql } from 'drizzle-orm';
import { countWords } from './services/validations.js';

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
      const names = dbCategories.map(c => c.name).filter(Boolean);
      if (names.length > 0) return names;
    }
  } catch (err) {
    console.log('[DB getCategories Notice]:', err instanceof Error ? err.message : err);
  }

  // Fallback to distinct categories from existing products or boutique defaults
  try {
    const prods = await getProducts();
    const prodCats = Array.from(new Set(prods.map(p => p.category).filter(Boolean)));
    if (prodCats.length > 0) {
      return Array.from(new Set([...CATEGORIES, ...prodCats]));
    }
  } catch {}

  return CATEGORIES;
}

export function matchesSlug(row: any, slug: string): boolean {
  if (!row || !slug) return false;
  const normSlug = slug.toLowerCase();
  const directSlug = (row.slug || '').toLowerCase();
  const feat = (row.features as Record<string, any>) || {};
  const rowSlug = (feat.slug || '').toLowerCase();
  const nameSlug = (row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return directSlug === normSlug || rowSlug === normSlug || nameSlug === normSlug;
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
    const dbImages = await db.select().from(productImagesTable).orderBy(asc(productImagesTable.orderIndex));
    const dbInventory = await db.select().from(inventryTable);
    const dbVariants = await db.select().from(productVariantTable);

    const statusMap = new Map(dbStatuses.map(s => [s.productId, s]));
    const categoryMap = new Map(dbCategories.map(c => [c.id, c.name]));
    const imagesMap = new Map<string, string[]>();
    for (const img of dbImages) {
      if (img.productId && img.url) {
        if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
        const list = imagesMap.get(img.productId)!;
        if (!list.includes(img.url)) {
          list.push(img.url);
        }
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
              const variantImgs = Array.from(new Set(
                dbImages
                  .filter(img => img.productId === r.id && img.productVariantId === v.id)
                  .map(img => img.url)
              ));
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
      const allUrls = Array.from(new Set(relationalImages.map(img => img.url)));
      const mainUrls = Array.from(new Set(
        relationalImages
          .filter(img => !img.productVariantId)
          .map(img => img.url)
      ));
      if (mainUrls.length > 0) {
        prod.images = Array.from(new Set([...mainUrls, ...allUrls]));
      } else {
        prod.images = allUrls;
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
        const variantImgs = Array.from(new Set(
          relationalImages
            .filter(img => img.productVariantId === v.id)
            .map(img => img.url)
        ));
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
      prod.status = statusRow[0].status;
      prod.inStock = statusRow[0].inStock ?? true;
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
  const descWords = countWords(description);
  if (descWords < 100) {
    throw new Error(`Product description must be at least 100 words (currently contains ${descWords} word${descWords === 1 ? '' : 's'})`);
  }
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
    const insertedImageUrls = new Set<string>();

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

      // Insert variant-specific images if any (deduplicate so same URL is not inserted twice)
      const variantSpecificImages = (v.images || []).map(img => img.trim()).filter(img => img !== '');
      for (let order = 0; order < variantSpecificImages.length; order++) {
        const imgUrl = variantSpecificImages[order];
        if (!insertedImageUrls.has(imgUrl)) {
          await tx.insert(productImagesTable).values({
            productId: insertedProduct.id,
            productVariantId: insertedVariant.id,
            url: imgUrl,
            orderIndex: order,
          });
          insertedImageUrls.add(imgUrl);
        }
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

    // 4. Insert main product images (only images not already inserted for a variant)
    let mainOrder = 0;
    for (let order = 0; order < allImages.length; order++) {
      const imgUrl = allImages[order];
      if (!insertedImageUrls.has(imgUrl)) {
        await tx.insert(productImagesTable).values({
          productId: insertedProduct.id,
          productVariantId: null,
          url: imgUrl,
          orderIndex: mainOrder++,
        });
        insertedImageUrls.add(imgUrl);
      }
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
    let targetRow: any = null;

    // Fast-path lookup by slug directly from DB
    try {
      const directRows = await db
        .select()
        .from(productTable)
        .where(
          sql`(${productTable.features}->>'slug' = ${slug} OR lower(${productTable.name}) = ${slug.toLowerCase()} OR lower(replace(${productTable.name}, ' ', '-')) = ${slug.toLowerCase()})`
        );
      if (directRows.length > 0) {
        targetRow = directRows.find((r: any) => !(r.features as any)?.isDiscontinued) || directRows[directRows.length - 1];
      }
    } catch (_) {}

    // Fallback if not matched by direct query
    if (!targetRow) {
      const dbProducts = await db.select().from(productTable);
      const matchingRows = dbProducts.filter((r: any) => matchesSlug(r, slug));
      if (matchingRows.length === 0) return null;
      targetRow = matchingRows.find((r: any) => !(r.features as any)?.isDiscontinued) || matchingRows[matchingRows.length - 1];
    }

    const currentFeat = (targetRow.features as Record<string, any>) || {};
    if (currentFeat.isDiscontinued) return null;

    // Check slug collision if slug is being updated
    if (updatedData.slug && updatedData.slug !== slug && updatedData.slug !== currentFeat.slug) {
      const dbProducts = await db.select().from(productTable);
      const slugExists = dbProducts.some(
        (r: any) => r.id !== targetRow.id && matchesSlug(r, updatedData.slug!)
      );
      if (slugExists) {
        throw new Error(`A product with slug "${updatedData.slug}" already exists`);
      }
    }

    // Validate description minimum 100 words if provided
    if (updatedData.description !== undefined && updatedData.description !== null && updatedData.description.trim() !== '') {
      const updateDescWords = countWords(updatedData.description);
      if (updateDescWords < 100) {
        throw new Error(`Product description must be at least 100 words (currently contains ${updateDescWords} word${updateDescWords === 1 ? '' : 's'})`);
      }
    }

    return await db.transaction(async (tx: any) => {
      // 1. Resolve category if provided
      let resolvedCategoryId: string | undefined = undefined;
      let resolvedCategoryName: string | undefined = undefined;

      if (updatedData.categoryId) {
        resolvedCategoryId = updatedData.categoryId;
        const [cat] = await tx
          .select()
          .from(categoryTable)
          .where(eq(categoryTable.id, resolvedCategoryId));
        if (cat) {
          resolvedCategoryName = cat.name;
        }
      } else if (updatedData.category) {
        resolvedCategoryName = updatedData.category.trim();
        const [existingCat] = await tx
          .select()
          .from(categoryTable)
          .where(eq(categoryTable.name, resolvedCategoryName));
        if (existingCat) {
          resolvedCategoryId = existingCat.id;
        } else {
          const [insertedCat] = await tx
            .insert(categoryTable)
            .values({ name: resolvedCategoryName })
            .returning();
          resolvedCategoryId = insertedCat.id;
        }
      }

      // 2. Resolve pricing
      const priceFallback = updatedData.price !== undefined ? updatedData.price : undefined;
      const effectiveMrp = updatedData.mrp !== undefined
        ? updatedData.mrp
        : (priceFallback !== undefined ? priceFallback : Number(targetRow.mrp || currentFeat.mrp || 0));
      const effectiveSellingPrice = updatedData.sellingPrice !== undefined
        ? updatedData.sellingPrice
        : (priceFallback !== undefined ? priceFallback : Number(targetRow.sellingPrice || currentFeat.sellingPrice || effectiveMrp));

      // 3. Sequential fetch of existing variants, inventory, and images (read-only for assembling return object)
      const existingDbVariants = await tx
        .select()
        .from(productVariantTable)
        .where(eq(productVariantTable.productId, targetRow.id));

      const existingInventory = await tx
        .select()
        .from(inventryTable)
        .where(eq(inventryTable.productId, targetRow.id));

      const existingDbImages = await tx
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.productId, targetRow.id))
        .orderBy(asc(productImagesTable.orderIndex));

      const invByVariant = new Map(existingInventory.map((inv: any) => [inv.productVariant, inv]));
      let totalStock = 0;
      const syncedVariants: ProductVariant[] = existingDbVariants.map((ev: any) => {
        const inv: any = invByVariant.get(ev.id);
        const avail = inv ? inv.availableStock : 0;
        totalStock += avail;
        const variantImgs = existingDbImages
          .filter((img: any) => img.productVariantId === ev.id)
          .map((img: any) => img.url);
        return {
          id: ev.id,
          color: ev.color,
          hexCode: ev.hexCode || undefined,
          stock: avail,
          reservedStock: inv ? inv.reservedStock : 0,
          images: variantImgs.length > 0 ? variantImgs : ((currentFeat.images as string[]) || []),
        };
      });

      if (syncedVariants.length === 0 && currentFeat.variants && currentFeat.variants.length > 0) {
        totalStock = (currentFeat.variants as any[]).reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      }

      const existingMainImages = existingDbImages
        .filter((img: any) => !img.productVariantId)
        .map((img: any) => img.url);
      const syncedMainImages = existingMainImages.length > 0
        ? existingMainImages
        : ((currentFeat.images as string[]) || []);

      // 4. Build features JSON with ONLY name, slug, category, mrp, selling price, fabric, fit, care, tags, description, and visibility
      const finalSlug = updatedData.slug !== undefined
        ? updatedData.slug
        : (currentFeat.slug || targetRow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      const finalCategoryName = resolvedCategoryName !== undefined
        ? resolvedCategoryName
        : (currentFeat.category || 'Uncategorized');
      const finalCategoryId = resolvedCategoryId !== undefined
        ? resolvedCategoryId
        : (targetRow.categoryId || currentFeat.categoryId);
      const finalIsListed = updatedData.isListed !== undefined
        ? updatedData.isListed
        : (updatedData.status !== undefined
            ? updatedData.status === 'listed'
            : (currentFeat.isListed !== false));

      const updatedFeat = {
        ...currentFeat,
        slug: finalSlug,
        category: finalCategoryName,
        categoryId: finalCategoryId,
        images: syncedMainImages,
        variants: syncedVariants.length > 0 ? syncedVariants : (currentFeat.variants || []),
        fabric: updatedData.fabric !== undefined ? updatedData.fabric : currentFeat.fabric,
        fit: updatedData.fit !== undefined ? updatedData.fit : currentFeat.fit,
        careInstructions: updatedData.careInstructions !== undefined ? updatedData.careInstructions : currentFeat.careInstructions,
        tags: updatedData.tags !== undefined ? updatedData.tags : (currentFeat.tags || targetRow.tags || []),
        isListed: finalIsListed,
        mrp: effectiveMrp,
        sellingPrice: effectiveSellingPrice,
      };

      // 5. Update product table
      const [updatedRow] = await tx
        .update(productTable)
        .set({
          name: updatedData.name !== undefined ? updatedData.name : targetRow.name,
          description: updatedData.description !== undefined ? updatedData.description : targetRow.description,
          mrp: effectiveMrp.toString(),
          sellingPrice: effectiveSellingPrice.toString(),
          isBestSeller: updatedData.bestseller !== undefined ? updatedData.bestseller : targetRow.isBestSeller,
          isLatest: updatedData.newArrival !== undefined ? updatedData.newArrival : targetRow.isLatest,
          isFeatured: updatedData.featured !== undefined ? updatedData.featured : targetRow.isFeatured,
          tags: updatedData.tags !== undefined ? updatedData.tags : (targetRow.tags as string[]),
          features: updatedFeat,
          ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
        })
        .where(eq(productTable.id, targetRow.id))
        .returning();

      // 6. Update product status
      const targetStatus = updatedData.status !== undefined
        ? updatedData.status
        : (updatedData.isListed !== undefined ? (updatedData.isListed ? 'listed' : 'unListed') : undefined);

      const targetInStock = updatedData.inStock !== undefined
        ? updatedData.inStock
        : undefined;

      let currentStatus: any = null;
      if (targetStatus !== undefined || targetInStock !== undefined) {
        currentStatus = await upsertProductStatus(targetRow.id, {
          status: targetStatus,
          inStock: targetInStock,
        }, tx);
      } else {
        const [existingStatus] = await tx
          .select()
          .from(productStatusTable)
          .where(eq(productStatusTable.productId, targetRow.id));
        currentStatus = existingStatus;
      }

      // 7. Construct returned Product
      const result = mapDbToProduct(updatedRow);
      result.category = finalCategoryName;
      result.categoryId = finalCategoryId;
      result.images = syncedMainImages;
      result.variants = syncedVariants.length > 0 ? syncedVariants : (currentFeat.variants || []);
      result.isListed = currentStatus ? currentStatus.status === 'listed' : finalIsListed;
      result.status = currentStatus ? currentStatus.status : (finalIsListed ? 'listed' : 'unListed');
      result.inStock = currentStatus ? (currentStatus.inStock ?? true) : (totalStock > 0);
      return result;
    });
  } catch (err) {
    console.error('[DB Product Update Notice]:', err instanceof Error ? err.message : err);
    throw err;
  }
}

/**
 * Dedicated procedure to change the order of images for a product.
 * Updates orderIndex in productImagesTable and synchronizes features.images.
 */
export async function reorderProductImages(idOrSlug: string, newImageUrls: string[]): Promise<string[]> {
  try {
    let targetRow: any = null;

    try {
      const directRows = await db
        .select()
        .from(productTable)
        .where(
          sql`(${productTable.id}::text = ${idOrSlug} OR ${productTable.features}->>'slug' = ${idOrSlug} OR lower(${productTable.name}) = ${idOrSlug.toLowerCase()} OR lower(replace(${productTable.name}, ' ', '-')) = ${idOrSlug.toLowerCase()})`
        );
      if (directRows.length > 0) {
        targetRow = directRows.find((r: any) => !(r.features as any)?.isDiscontinued) || directRows[directRows.length - 1];
      }
    } catch (_) {}

    if (!targetRow) {
      const dbProducts = await db.select().from(productTable);
      targetRow = dbProducts.find((r: any) => matchesSlug(r, idOrSlug) || r.id === idOrSlug);
      if (!targetRow) {
        throw new Error(`Product not found: "${idOrSlug}"`);
      }
    }

    const cleanUrls = Array.from(new Set(newImageUrls.map(u => u.trim()).filter(Boolean)));
    if (cleanUrls.length === 0) {
      throw new Error('At least one image URL is required to reorder.');
    }

    return await db.transaction(async (tx: any) => {
      // 1. Fetch current images for this product
      const existingDbImages = await tx
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.productId, targetRow.id))
        .orderBy(asc(productImagesTable.orderIndex));

      // 2. Update orderIndex in productImagesTable for each image
      for (let o = 0; o < cleanUrls.length; o++) {
        const url = cleanUrls[o];
        const matching = existingDbImages.find((img: any) => img.url === url);
        if (matching) {
          if (matching.orderIndex !== o) {
            await tx
              .update(productImagesTable)
              .set({ orderIndex: o, updatedAt: new Date() })
              .where(eq(productImagesTable.id, matching.id));
          }
        } else {
          await tx.insert(productImagesTable).values({
            productId: targetRow.id,
            productVariantId: null,
            url,
            orderIndex: o,
          });
        }
      }

      // 3. Update features.images and variants on productTable to keep them consistent
      const currentFeat = (targetRow.features as Record<string, any>) || {};
      const updatedVariants = (currentFeat.variants || []).map((v: any) => {
        const vImgs = Array.isArray(v.images) ? v.images : [];
        if (vImgs.length === 0) return { ...v, images: cleanUrls };
        const sorted = [...vImgs].sort((a, b) => {
          const idxA = cleanUrls.indexOf(a);
          const idxB = cleanUrls.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return 0;
        });
        return {
          ...v,
          images: sorted,
        };
      });

      const updatedFeat = {
        ...currentFeat,
        images: cleanUrls,
        variants: updatedVariants.length > 0 ? updatedVariants : currentFeat.variants,
      };

      await tx
        .update(productTable)
        .set({ features: updatedFeat })
        .where(eq(productTable.id, targetRow.id));

      return cleanUrls;
    });
  } catch (err) {
    console.error('[reorderProductImages Error]:', err instanceof Error ? err.message : err);
    throw err;
  }
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

export interface GetPaginatedProductsInput {
  search?: string | null;
  category?: string | null;
  filter?: 'new' | 'bestseller' | 'all' | null;
  inStockOnly?: boolean | null;
  sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'newest' | 'default' | null;
  page?: number | null;
  limit?: number | null;
}

export async function getPaginatedProducts(input?: GetPaginatedProductsInput) {
  const page = Math.max(1, input?.page || 1);
  const limit = Math.max(1, input?.limit || 8);
  const search = (input?.search || '').trim().toLowerCase();
  const category = (input?.category || 'All').trim();
  const inStockOnly = !!input?.inStockOnly;
  const sortBy = input?.sortBy || 'name-asc';

  let list = (await getProducts()).filter(
    (p) =>
      p.isListed !== false &&
      p.status !== 'unListed' &&
      p.status !== 'discontinued' &&
      !(p as any).isDiscontinued &&
      !(p as any).features?.isDiscontinued
  );

  if (search) {
    list = list.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const fabric = (p.fabric || '').toLowerCase();
      return name.includes(search) || cat.includes(search) || slug.includes(search) || fabric.includes(search);
    });
  }

  if (category && category !== 'All') {
    const normCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    list = list.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const catSlug = cat.replace(/[^a-z0-9]+/g, '-');
      return cat === category.toLowerCase() || catSlug === normCategory;
    });
  }

  if (input?.filter === 'new') {
    list = list.filter((p) => p.newArrival);
  } else if (input?.filter === 'bestseller') {
    list = list.filter((p) => p.bestseller);
  }

  if (inStockOnly) {
    list = list.filter((p) => {
      if (p.inStock === false) return false;
      if (!p.variants || p.variants.length === 0) return true;
      return p.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) > 0;
    });
  }

  list.sort((a, b) => {
    const priceA = Number(a.sellingPrice || a.price || 0);
    const priceB = Number(b.sellingPrice || b.price || 0);
    const nameA = (a.name || '').trim();
    const nameB = (b.name || '').trim();

    const getStockCount = (prod: Product) => {
      if (!prod.variants || prod.variants.length === 0) return 0;
      return prod.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    };

    switch (sortBy) {
      case 'name-asc':
        return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
      case 'name-desc':
        return nameB.localeCompare(nameA, 'en', { sensitivity: 'base' });
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'stock-desc':
        return getStockCount(b) - getStockCount(a);
      case 'stock-asc':
        return getStockCount(a) - getStockCount(b);
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
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
  };
}
