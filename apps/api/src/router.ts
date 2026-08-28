import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { z } from 'zod';
import { productsRouter, reviewsRouter } from '@repo/products/router';
import * as trpcExpress from '@trpc/server/adapters/express';

import crypto from 'crypto';

const SECRET_KEY = 'jb51-staff-token-secret-signing-key';

export function generateExpiringToken(username: string): string {
  // Expires in 1 hour
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const payload = JSON.stringify({ username, expiresAt });
  
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

export function verifyExpiringToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadBase64, signature] = parts;
    const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) return false;
    
    const data = JSON.parse(payload);
    if (Date.now() > data.expiresAt) {
      return false; // Expired!
    }
    return data.username === 'admin';
  } catch {
    return false;
  }
}

export const createTRPCContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const authHeader = req?.headers?.authorization;
  let isStaff = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    isStaff = verifyExpiringToken(token);
  }
  return {
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
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      if (input.username.toLowerCase() === 'admin' && input.password === 'admin@123') {
        const token = generateExpiringToken(input.username);
        return { success: true, token };
      }
      throw new Error('Invalid credentials');
    }),
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
