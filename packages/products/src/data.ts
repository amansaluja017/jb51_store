import { db, product as productTable, productStatus as productStatusTable } from '@repo/db';
import { eq } from 'drizzle-orm';

export interface ProductVariant {
  color: string;
  size?: string;
  stock: number;
  reservedStock?: number;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
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
}

export const CATEGORIES = [
  'Formal Suits',
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear'
];

function matchesSlug(row: any, slug: string): boolean {
  const feat = (row.features as Record<string, any>) || {};
  const normSlug = slug.toLowerCase();
  const rowSlug = (feat.slug || '').toLowerCase();
  const nameSlug = (row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return rowSlug === normSlug || nameSlug === normSlug;
}

function mapDbToProduct(row: any): Product {
  const features = (row.features as Record<string, any>) || {};
  return {
    id: row.id,
    name: row.name,
    slug: features.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: row.description || '',
    price: Number(row.price),
    category: features.category || 'Uncategorized',
    images: features.images || [],
    fabric: features.fabric || '',
    fit: features.fit || '',
    careInstructions: features.careInstructions || '',
    variants: features.variants || [],
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

export async function getProducts(): Promise<Product[]> {
  try {
    const dbProducts = await db.select().from(productTable);
    const dbStatuses = await db.select().from(productStatusTable);
    const statusMap = new Map(dbStatuses.map(s => [s.productId, s]));

    if (dbProducts && dbProducts.length > 0) {
      const mapped = dbProducts
        .filter((r: any) => {
          const feat = (r.features as Record<string, any>) || {};
          const status = statusMap.get(r.id);
          return !feat.isDiscontinued && status?.status !== 'discontinued';
        })
        .map((r: any) => {
          const prod = mapDbToProduct(r);
          const status = statusMap.get(r.id);
          if (status) {
            prod.isListed = status.status === 'listed';
            (prod as any).inStock = status.inStock ?? true;
          } else {
            (prod as any).inStock = true;
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

export async function createProduct(productInput: Partial<Product> & { name: string; slug: string; price: number }): Promise<Product> {
  const newProd: Product = {
    id: productInput.id || Math.random().toString(36).substring(2, 9),
    name: productInput.name,
    slug: productInput.slug,
    description: productInput.description || '',
    price: productInput.price,
    category: productInput.category || 'Uncategorized',
    images: productInput.images || [],
    fabric: productInput.fabric || '',
    fit: productInput.fit || '',
    careInstructions: productInput.careInstructions || '',
    variants: productInput.variants || [],
    featured: productInput.featured || false,
    newArrival: productInput.newArrival || false,
    bestseller: productInput.bestseller || false,
    isListed: productInput.isListed !== false,
    tags: productInput.tags || [],
    createdAt: productInput.createdAt || new Date().toISOString(),
  };

  try {
    const createdFromDb = await db.transaction(async (tx: any) => {
      const [insertedRow] = await tx.insert(productTable).values({
        name: newProd.name,
        description: newProd.description,
        price: newProd.price.toString(),
        isBestSeller: newProd.bestseller,
        isLatest: newProd.newArrival,
        isFeatured: newProd.featured,
        tags: newProd.tags,
        features: {
          slug: newProd.slug,
          category: newProd.category,
          images: newProd.images,
          fabric: newProd.fabric,
          fit: newProd.fit,
          careInstructions: newProd.careInstructions,
          variants: newProd.variants,
          isListed: newProd.isListed,
        },
      }).returning();

      if (!insertedRow) {
        throw new Error('Product insertion returned empty result');
      }

      const initialStatus = newProd.isListed ? 'listed' : 'unListed';
      await upsertProductStatus(insertedRow.id, { status: initialStatus, inStock: true }, tx);

      return mapDbToProduct(insertedRow);
    });

    if (createdFromDb) {
      return createdFromDb;
    }
  } catch (err) {
    console.error('[DB Product Creation Notice]:', err instanceof Error ? err.message : err);
    throw err;
  }

  return newProd;
}

export async function updateProduct(slug: string, updatedData: Partial<Product>): Promise<Product | null> {
  try {
    const dbProducts = await db.select().from(productTable);
    const targetRow = dbProducts.find((r: any) => matchesSlug(r, slug));

    if (targetRow) {
      const currentFeat = (targetRow.features as Record<string, any>) || {};
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
      };

      return await db.transaction(async (tx: any) => {
        const [updatedRow] = await tx
          .update(productTable)
          .set({
            name: updatedData.name !== undefined ? updatedData.name : targetRow.name,
            description: updatedData.description !== undefined ? updatedData.description : targetRow.description,
            price: updatedData.price !== undefined ? updatedData.price.toString() : targetRow.price,
            isBestSeller: updatedData.bestseller !== undefined ? updatedData.bestseller : targetRow.isBestSeller,
            isLatest: updatedData.newArrival !== undefined ? updatedData.newArrival : targetRow.isLatest,
            isFeatured: updatedData.featured !== undefined ? updatedData.featured : targetRow.isFeatured,
            tags: updatedData.tags !== undefined ? updatedData.tags : (targetRow.tags as string[]),
            features: updatedFeat,
          })
          .where(eq(productTable.id, targetRow.id))
          .returning();

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
