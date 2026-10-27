import { db, wishlist as wishlistTable, wishlistItems as wishlistItemsTable, product as productTable } from '@repo/db';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Get wishlist items for a given browser fingerprint.
 */
export async function getWishlistByFingerprint(
  fingerprint: string
): Promise<{ id: string | null; fingerprint: string; productIds: string[] }> {
  if (!fingerprint || !fingerprint.trim()) {
    return { id: null, fingerprint: '', productIds: [] };
  }

  const cleanFingerprint = fingerprint.trim();
  const existingList = await db
    .select()
    .from(wishlistTable)
    .where(eq(wishlistTable.fingerprint, cleanFingerprint));

  if (!existingList || existingList.length === 0) {
    return { id: null, fingerprint: cleanFingerprint, productIds: [] };
  }

  const currentWishlist = existingList[0];
  const items = await db
    .select({ productId: wishlistItemsTable.productId })
    .from(wishlistItemsTable)
    .where(eq(wishlistItemsTable.wishlistId, currentWishlist.id));

  return {
    id: currentWishlist.id,
    fingerprint: cleanFingerprint,
    productIds: items.map((item) => item.productId),
  };
}

/**
 * Synchronize wishlist items associated with a browser fingerprint.
 */
export async function syncWishlist(fingerprint: string, productIds: string[]) {
  const cleanFingerprint = (fingerprint || 'anonymous-device').trim();
  const cleanProductIds = Array.from(new Set((productIds || []).filter(Boolean)));

  // 1. Get or create wishlist record
  let wishlistId: string;
  const existingList = await db
    .select()
    .from(wishlistTable)
    .where(eq(wishlistTable.fingerprint, cleanFingerprint));

  if (existingList && existingList.length > 0) {
    wishlistId = existingList[0].id;
  } else {
    const [created] = await db
      .insert(wishlistTable)
      .values({
        fingerprint: cleanFingerprint,
      })
      .returning();
    wishlistId = created.id;
  }

  // 2. Fetch current wishlist items in database
  const currentItems = await db
    .select()
    .from(wishlistItemsTable)
    .where(eq(wishlistItemsTable.wishlistId, wishlistId));

  const currentProductIds = new Set(currentItems.map((item) => item.productId));

  // 3. Find valid product IDs that actually exist in the product table
  let validProductIds: string[] = [];
  if (cleanProductIds.length > 0) {
    // Check which IDs are valid UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUuids = cleanProductIds.filter((id) => uuidRegex.test(id));

    if (validUuids.length > 0) {
      const dbProducts = await db
        .select({ id: productTable.id })
        .from(productTable)
        .where(inArray(productTable.id, validUuids));
      validProductIds = dbProducts.map((p) => p.id);
    }
  }

  const validProductIdSet = new Set(validProductIds);

  // 4. Remove items that are no longer in cleanProductIds
  const itemsToDelete = currentItems.filter((item) => !cleanProductIds.includes(item.productId));
  for (const item of itemsToDelete) {
    await db
      .delete(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.wishlistId, wishlistId),
          eq(wishlistItemsTable.productId, item.productId)
        )
      );
  }

  // 5. Add new items that aren't in current database items
  for (const pid of validProductIds) {
    if (!currentProductIds.has(pid)) {
      try {
        await db.insert(wishlistItemsTable).values({
          wishlistId,
          productId: pid,
        });
      } catch (_) {
        // Ignore duplicate inserts gracefully
      }
    }
  }

  // 6. Return refreshed items
  const updatedItems = await db
    .select({ productId: wishlistItemsTable.productId })
    .from(wishlistItemsTable)
    .where(eq(wishlistItemsTable.wishlistId, wishlistId));

  const finalProductIds = Array.from(
    new Set([...updatedItems.map((i) => i.productId), ...cleanProductIds.filter((id) => !validProductIdSet.has(id))])
  );

  return {
    success: true,
    count: finalProductIds.length,
    productIds: finalProductIds,
  };
}

/**
 * Add a single product to wishlist for a browser fingerprint.
 */
export async function addToWishlist(fingerprint: string, productId: string) {
  const cleanFingerprint = (fingerprint || 'anonymous-device').trim();
  const cleanProductId = productId.trim();

  // Get or create wishlist record
  let wishlistId: string;
  const existingList = await db
    .select()
    .from(wishlistTable)
    .where(eq(wishlistTable.fingerprint, cleanFingerprint));

  if (existingList && existingList.length > 0) {
    wishlistId = existingList[0].id;
  } else {
    const [created] = await db
      .insert(wishlistTable)
      .values({
        fingerprint: cleanFingerprint,
      })
      .returning();
    wishlistId = created.id;
  }

  // If valid product UUID, check and insert
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cleanProductId)) {
    const dbProduct = await db
      .select({ id: productTable.id })
      .from(productTable)
      .where(eq(productTable.id, cleanProductId));

    if (dbProduct && dbProduct.length > 0) {
      const existingItem = await db
        .select()
        .from(wishlistItemsTable)
        .where(
          and(
            eq(wishlistItemsTable.wishlistId, wishlistId),
            eq(wishlistItemsTable.productId, cleanProductId)
          )
        );

      if (!existingItem || existingItem.length === 0) {
        await db.insert(wishlistItemsTable).values({
          wishlistId,
          productId: cleanProductId,
        });
      }
    }
  }

  return {
    success: true,
    productId: cleanProductId,
  };
}

/**
 * Remove a single product from wishlist for a browser fingerprint.
 */
export async function removeFromWishlist(fingerprint: string, productId: string) {
  const cleanFingerprint = (fingerprint || 'anonymous-device').trim();
  const cleanProductId = productId.trim();

  const existingList = await db
    .select()
    .from(wishlistTable)
    .where(eq(wishlistTable.fingerprint, cleanFingerprint));

  if (existingList && existingList.length > 0) {
    const wishlistId = existingList[0].id;
    await db
      .delete(wishlistItemsTable)
      .where(
        and(
          eq(wishlistItemsTable.wishlistId, wishlistId),
          eq(wishlistItemsTable.productId, cleanProductId)
        )
      );
  }

  return {
    success: true,
    productId: cleanProductId,
  };
}
