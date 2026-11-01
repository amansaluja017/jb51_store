import express, { Express } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import {
  globalRateLimiter,
  trpcRateLimiter,
  uploadRateLimiter,
} from '@repo/rate-limiting';
import { appRouter, createTRPCContext } from './router.js';
import { corsOptions } from './config/cors.js';
import uploadRouter from './routes/upload.js';

export function createApp(): Express {
  const app = express();

  // Trust reverse proxy hops (Nginx, cloud load balancers, CDN)
  app.set('trust proxy', 1);

  // Enable CORS with dynamic client origin resolution
  app.use(cors(corsOptions));

  // Request parsing with generous payload limits for uploads/analytics
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global rate limiter across all incoming traffic
  app.use(globalRateLimiter);

  // Health check endpoint
  app.get(['/', '/health'], (_req, res) => {
    res.json({
      status: 'ok',
      service: 'JB51 Store API',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API endpoints with specialized upload rate limiting
  app.use('/api', uploadRateLimiter, uploadRouter);

  // tRPC handler with procedure-level rate limiting
  app.use(
    '/trpc',
    trpcRateLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext: createTRPCContext,
    })
  );

  return app;
}
