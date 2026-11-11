import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import {
  globalRateLimiter,
  trpcRateLimiter,
  uploadRateLimiter,
} from '@repo/rate-limiting';
import { appRouter, createTRPCContext } from './router.js';
import { corsOptions } from './config/cors.js';
import uploadRouter from './routes/upload.js';
import docsRouter from './routes/docs.js';

export function createApp(): Express {
  const app = express();

  // Trust reverse proxy hops (Nginx, cloud load balancers, CDN)
  app.set('trust proxy', 1);

  // Enable CORS with dynamic client origin resolution and preflight handling FIRST
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to permit Scalar docs and external frontend clients
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
    })
  );

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

  // OpenAPI JSON specification
  app.get('/openapi.json', (_req, res) => res.redirect('/docs/openapi.json'));

  // Scalar Interactive OpenAPI Documentation & /docs/openapi.json
  app.use('/docs', docsRouter);
  app.get('/reference', (_req, res) => res.redirect('/docs'));

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
