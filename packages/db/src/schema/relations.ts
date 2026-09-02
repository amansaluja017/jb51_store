import { relations } from 'drizzle-orm';
import { user } from './users';
import { token } from './tokens';
import { category } from './categories';
import { product } from './products';
import { productStatus } from './product-status';
import { reviews } from './reviews';
import { productAnalytics } from './product-analytics';
import { invoices } from './invoices';
import { wishlist } from './wishlist';
import { wishlistItems } from './wishlist-items';

export const userRelations = relations(user, ({ many }) => ({
  tokens: many(token),
  reviews: many(reviews),
  invoices: many(invoices),
}));

export const tokenRelations = relations(token, ({ one }) => ({
  user: one(user, {
    fields: [token.userId],
    references: [user.id],
  }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  status: one(productStatus, {
    fields: [product.id],
    references: [productStatus.productId],
  }),
  analytics: one(productAnalytics, {
    fields: [product.id],
    references: [productAnalytics.productId],
  }),
  invoices: many(invoices),
  wishlistItems: many(wishlistItems),
}));

export const productStatusRelations = relations(productStatus, ({ one }) => ({
  product: one(product, {
    fields: [productStatus.productId],
    references: [product.id],
  }),
}));

export const productAnalyticsRelations = relations(productAnalytics, ({ one }) => ({
  product: one(product, {
    fields: [productAnalytics.productId],
    references: [product.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  admin: one(user, {
    fields: [reviews.adminId],
    references: [user.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(user, {
    fields: [invoices.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [invoices.productId],
    references: [product.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ many }) => ({
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlist, {
    fields: [wishlistItems.wishlistId],
    references: [wishlist.id],
  }),
  product: one(product, {
    fields: [wishlistItems.productId],
    references: [product.id],
  }),
}));
