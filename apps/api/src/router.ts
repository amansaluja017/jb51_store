import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { z } from 'zod';
import { authRouter } from '@repo/auth/router';
import { authenticateToken, JwtPayload } from '@repo/auth';
import {
  productsRouter,
  reviewsRouter,
  inventoryRouter,
  customersRouter,
  ordersRouter,
  invoicesRouter,
} from '@repo/products/router';
export type { ReviewItem } from '@repo/products';
import * as trpcExpress from '@trpc/server/adapters/express';

export const createTRPCContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const authHeader = req?.headers?.authorization;
  let user: JwtPayload | null = null;
  let isStaff = false;

  if (authHeader) {
    user = authenticateToken(authHeader);
    if (user && user.role === 'admin') {
      isStaff = true;
    }
  }

  return {
    user,
    isStaff,
  };
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
  auth: authRouter,
  products: productsRouter,
  reviews: reviewsRouter,
  inventory: inventoryRouter,
  customers: customersRouter,
  orders: ordersRouter,
  invoices: invoicesRouter,
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  wishlist: createTRPCRouter({
    sync: publicProcedure
      .input(z.object({ productIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        return { success: true, count: input.productIds.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
