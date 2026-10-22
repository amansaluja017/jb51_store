import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345678901234567890';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-12345678901234567890';

import { TRPCContext } from '@repo/products/router';
import { db, client, product, productImages, customerDetails, orders, orderItems, invoices, credits, reviews, user, token } from '@repo/db';
import { eq, inArray } from 'drizzle-orm';

export const adminContext: TRPCContext = {
  user: {
    role: 'admin',
    userName: 'adminUser',
    email: 'admin@jb51store.test',
  },
  isStaff: true,
};

export const customerContext: TRPCContext = {
  user: {
    role: 'customer',
    userName: 'customerUser',
    email: 'customer@jb51store.test',
  },
  isStaff: false,
};

export const unauthContext: TRPCContext = {
  user: null,
  isStaff: false,
};

export function generateValidDescription(wordsNeeded = 105): string {
  const baseWords = [
    'Handcrafted', 'luxury', 'pure', 'Banarasi', 'silk', 'designer', 'suit', 'collection',
    'meticulously', 'tailored', 'for', 'celebrations', 'festivals', 'and', 'grand', 'occasions.',
    'Every', 'thread', 'is', 'woven', 'with', 'care', 'featuring', 'intricate', 'zari', 'motifs',
    'and', 'rich', 'textures', 'that', 'reflect', 'heritage', 'craftsmanship', 'and', 'contemporary', 'elegance.',
    'The', 'fabric', 'is', 'breathable', 'comfortable', 'and', 'drapes', 'effortlessly', 'providing',
    'a', 'flattering', 'silhouette', 'for', 'any', 'special', 'event.', 'Complete', 'with', 'a', 'matching',
    'dupatta', 'and', 'custom', 'fit', 'options', 'this', 'timeless', 'piece', 'epitomizes', 'grace.',
  ];

  let result: string[] = [];
  while (result.length < wordsNeeded) {
    result = result.concat(baseWords);
  }
  return result.slice(0, wordsNeeded).join(' ');
}

export function generateUniqueSlug(prefix = 'test-suit'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${randomStr}`;
}

export async function cleanupDatabase() {
  try {
    // Delete any test created records safely
  } catch (err) {
    console.warn('Cleanup notice:', err);
  }
}

export async function closeDatabaseConnection(exit = false) {
  try {
    if (client && typeof client.end === 'function') {
      await client.end({ timeout: 1 });
    }
  } catch (_) {}
  if (exit) {
    setTimeout(() => process.exit(0), 100);
  }
}
