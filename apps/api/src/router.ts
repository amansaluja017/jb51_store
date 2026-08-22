import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { productsRouter } from '@repo/products';

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
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
});

export type AppRouter = typeof appRouter;
