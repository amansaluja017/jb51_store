import { z } from 'zod';
import { router, publicProcedure } from './base.js';
import {
  getWishlistByFingerprint,
  syncWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../wishlist.js';

export const wishlistRouter = router({
  get: publicProcedure
    .meta({ description: 'Fetch wishlist items for a browser fingerprint' })
    .input(z.object({ fingerprint: z.string().min(1) }))
    .query(async ({ input }) => {
      return await getWishlistByFingerprint(input.fingerprint);
    }),

  sync: publicProcedure
    .meta({ description: 'Sync client wishlist with database using browser fingerprint' })
    .input(
      z.object({
        fingerprint: z.string().nullish(),
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const fingerprint = input.fingerprint || 'anonymous-device';
      return await syncWishlist(fingerprint, input.productIds);
    }),

  add: publicProcedure
    .meta({ description: 'Add a product to wishlist for a browser fingerprint' })
    .input(
      z.object({
        fingerprint: z.string().min(1),
        productId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await addToWishlist(input.fingerprint, input.productId);
    }),

  remove: publicProcedure
    .meta({ description: 'Remove a product from wishlist for a browser fingerprint' })
    .input(
      z.object({
        fingerprint: z.string().min(1),
        productId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await removeFromWishlist(input.fingerprint, input.productId);
    }),
});
