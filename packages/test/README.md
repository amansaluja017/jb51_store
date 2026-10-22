# API Route & Controller Test Suites (`@repo/test`)

Comprehensive end-to-end integration and unit test coverage for the JB51 Store backend API.

## Structure & Coverage

| Test File | Target Routes & Controllers | Coverage Details |
|---|---|---|
| [`src/auth.test.ts`](./src/auth.test.ts) | `@repo/auth` (`authRouter`, `auth.service`, `jwt`, `password`) | Register, Login, RefreshToken rotation, ChangePassword, Logout, JWT generation & verification, role checks |
| [`src/products.test.ts`](./src/products.test.ts) | `@repo/products` (`productsRouter`, `data.ts`) | `getAll`, `getPaginated`, `getBySlug`, `create` (>=100 words validation), `update`, `reorderImages`, `getStatus`, `updateStatus`, `delete`, `getCategories` |
| [`src/reviews.test.ts`](./src/reviews.test.ts) | `@repo/products` (`reviewsRouter`, `reviews.ts`) | `getAll`, `getModerationQueue`, `create` (public default unapproved vs admin auto-approve), `update`, `delete` |
| [`src/inventory.test.ts`](./src/inventory.test.ts) | `@repo/products` (`inventoryRouter`, `inventory.ts`) | `getPaginated` (stock filtering & metrics), `getTransactions`, `recordTransaction` ('sale' vs 'purchase') |
| [`src/customers.test.ts`](./src/customers.test.ts) | `@repo/products` (`customersRouter`, `customers.ts`) | `getAll`, `getPaginated`, `create`, `update`, `getOrderHistory`, `delete` |
| [`src/orders.test.ts`](./src/orders.test.ts) | `@repo/products` (`ordersRouter`, `orders.ts`) | `getAll`, `create` (item schema transformation, automatic order numbers, inventory updates, credit due amount) |
| [`src/invoices.test.ts`](./src/invoices.test.ts) | `@repo/products` (`invoicesRouter`, `invoices.ts`) | `getAll`, `create` (payment modes cash/online/credit, tax/discount calculation), `delete` |
| [`src/credits.test.ts`](./src/credits.test.ts) | `@repo/products` (`creditsRouter`, `credits.ts`) | `getAll` (metrics: totalDue, totalPaid, overdueCount), `create`, `update`, `recordPayment`, `delete` |
| [`src/upload.test.ts`](./src/upload.test.ts) | `apps/api` (`uploadRouter`, `cloudinary.ts`) | REST health endpoints (`GET /`, `GET /health`), `POST /api/upload`, `POST /api/upload/multiple`, `GET /api/products/:productId/images`, `DELETE /api/products/images/:id`, `DELETE /api/upload`, `PATCH /api/products/images/reorder` |
| [`src/router.test.ts`](./src/router.test.ts) | `apps/api` (`router.ts`, `createTRPCContext`) | Bearer token authentication resolution, admin `isStaff` assignment, `health` query, `wishlist.sync` mutation |
| [`src/rate-limiting.test.ts`](./src/rate-limiting.test.ts) | `@repo/rate-limiting` (`index.ts`) | Global, Auth, Upload, and tRPC rate limiters, 429 threshold enforcement |

## Running Tests

From monorepo root:

```bash
# Run all API tests
pnpm --filter @repo/test test

# Run individual test suites
pnpm --filter @repo/test test:auth
pnpm --filter @repo/test test:products
pnpm --filter @repo/test test:reviews
pnpm --filter @repo/test test:inventory
pnpm --filter @repo/test test:customers
pnpm --filter @repo/test test:orders
pnpm --filter @repo/test test:invoices
pnpm --filter @repo/test test:credits
pnpm --filter @repo/test test:upload
pnpm --filter @repo/test test:router
pnpm --filter @repo/test test:rate-limiting
```
