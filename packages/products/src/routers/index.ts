export {
  t,
  router,
  publicProcedure,
  adminProcedure,
  type RouteMeta,
  type TRPCContext,
} from './base.js';

export { productsRouter } from './products.js';
export { reviewsRouter } from './reviews.js';
export { inventoryRouter } from './inventory.js';
export { customersRouter } from './customers.js';
export { ordersRouter, orderItemSchema } from './orders.js';
export { invoicesRouter } from './invoices.js';
export { creditsRouter } from './credits.js';
export { analyticsRouter } from './analytics.js';
export { inquiriesRouter } from './inquiries.js';
export { wishlistRouter } from './wishlist.js';
export { siteConfigRouter } from './site-config.js';
