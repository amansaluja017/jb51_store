import { relations } from 'drizzle-orm';
import { user } from './users.js';
import { token } from './tokens.js';
import { category } from './categories.js';
import { product } from './products.js';
import { productStatus } from './product-status.js';
import { productVariant } from './product-variants.js';
import { inventry } from './inventory.js';
import { inventryTransaction } from './inventory-transactions.js';
import { reviews } from './reviews.js';
import { productAnalytics } from './product-analytics.js';
import { invoices } from './invoices.js';
import { orders } from './orders.js';
import { orderItems } from './order-items.js';
import { wishlist } from './wishlist.js';
import { wishlistItems } from './wishlist-items.js';
import { productImages } from './product-images.js';

import { customerDetails } from './customer-details.js';

export const userRelations = relations(user, ({ many }) => ({
  tokens: many(token),
  reviews: many(reviews),
  invoices: many(invoices),
  orders: many(orders),
  customerDetails: many(customerDetails),
  inventryTransactions: many(inventryTransaction),
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
  variants: many(productVariant),
  inventry: many(inventry),
  inventryTransactions: many(inventryTransaction),
  invoices: many(invoices),
  orderItems: many(orderItems),
  wishlistItems: many(wishlistItems),
  images: many(productImages),
}));

export const productVariantRelations = relations(productVariant, ({ one, many }) => ({
  product: one(product, {
    fields: [productVariant.productId],
    references: [product.id],
  }),
  inventry: many(inventry),
  inventryTransactions: many(inventryTransaction),
  orderItems: many(orderItems),
  images: many(productImages),
}));

export const inventryRelations = relations(inventry, ({ one }) => ({
  product: one(product, {
    fields: [inventry.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [inventry.productVariant],
    references: [productVariant.id],
  }),
}));

export const inventryTransactionRelations = relations(inventryTransaction, ({ one }) => ({
  product: one(product, {
    fields: [inventryTransaction.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [inventryTransaction.productVariant],
    references: [productVariant.id],
  }),
  customer: one(customerDetails, {
    fields: [inventryTransaction.customerId],
    references: [customerDetails.id],
  }),
  user: one(user, {
    fields: [inventryTransaction.userId],
    references: [user.id],
  }),
}));

export const customerDetailsRelations = relations(customerDetails, ({ one, many }) => ({
  user: one(user, {
    fields: [customerDetails.userId],
    references: [user.id],
  }),
  transactions: many(inventryTransaction),
  orders: many(orders),
  invoices: many(invoices),
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

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  customer: one(customerDetails, {
    fields: [orders.customerId],
    references: [customerDetails.id],
  }),
  invoices: many(invoices),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(product, {
    fields: [orderItems.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [orderItems.productVariantId],
    references: [productVariant.id],
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
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  customer: one(customerDetails, {
    fields: [invoices.customerId],
    references: [customerDetails.id],
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

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(product, {
    fields: [productImages.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [productImages.productVariantId],
    references: [productVariant.id],
  }),
}));
