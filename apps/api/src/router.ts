import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { z } from 'zod';
import { productsRouter, reviewsRouter } from '@repo/products/router';

export const createTRPCContext = async () => {
  return {};
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const appRouter = createTRPCRouter({
  products: productsRouter,
  reviews: reviewsRouter,
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  wishlist: createTRPCRouter({
    sync: publicProcedure
      .input(z.object({ productIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        // Mock server logging for background sync
        console.log('--- Background Wishlist Sync ---');
        console.log('Received productIds:', input.productIds);
        return { success: true, count: input.productIds.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
