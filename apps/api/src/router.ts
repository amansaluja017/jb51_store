import { createTRPCRouter, publicProcedure } from './trpc/init.js';
import { createTRPCContext, type TRPCContext } from './trpc/context.js';
import { authRouter } from '@repo/auth/router';
import {
  productsRouter,
  reviewsRouter,
  inventoryRouter,
  customersRouter,
  ordersRouter,
  invoicesRouter,
  creditsRouter,
  analyticsRouter,
  inquiriesRouter,
  wishlistRouter,
  siteConfigRouter,
} from '@repo/products/router';

export { createTRPCContext, type TRPCContext };
export type { ReviewItem, InquiryItem } from '@repo/products';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  products: productsRouter,
  reviews: reviewsRouter,
  inventory: inventoryRouter,
  customers: customersRouter,
  orders: ordersRouter,
  invoices: invoicesRouter,
  credits: creditsRouter,
  analytics: analyticsRouter,
  inqueries: inquiriesRouter, // Backward-compatibility alias for mobile client
  inquiries: inquiriesRouter,
  health: publicProcedure.query(() => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })),
  wishlist: wishlistRouter,
  siteConfig: siteConfigRouter,
});

export type AppRouter = typeof appRouter;
