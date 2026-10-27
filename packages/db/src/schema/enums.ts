import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'seller']);

export const tokenTypeEnum = pgEnum('token_type', [
  'refreshToken',
  'verificationToken',
  'passwordResetToken',
]);

export const productStatusEnum = pgEnum('product_status_enum', [
  'listed',
  'unListed',
  'discontinued'
]);

export const inqueryTypeEnum = pgEnum('inquery_type', [
  'general',
  'sales',
  'support',
  'product',
  'other',
]);

export const inqueryStatusEnum = pgEnum('inquery_status', [
  'resolved',
  'pending',
  'responded',
]);

export const invoiceModeEnum = pgEnum('invoice_mode', ['cash', 'online', 'credit']);

export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', [
  'purchase',
  'sale',
  'reservation',
  'release',
  'return',
  'adjustment',
]);
