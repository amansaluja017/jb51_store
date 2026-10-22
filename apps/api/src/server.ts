import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import {
  globalRateLimiter,
  trpcRateLimiter,
  uploadRateLimiter,
} from '@repo/rate-limiting';
import { appRouter, createTRPCContext } from './router.js';
import uploadRouter from './routes/upload.js';

const app = express();
const port = process.env.PORT || 3001;

// Trust reverse proxy hops (e.g., Nginx, cloud load balancers, CDN)
app.set('trust proxy', 1);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19006', 'http://10.220.109.189:3000', 'http://10.220.109.189:8081', 'http://10.220.109.189:19006'];

// Enable CORS for Web and Mobile clients
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        /^http:\/\/(10\.|192\.168\.|172\.)/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to ensure mobile app always connects
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate Limiting: Apply global rate limiter across ALL routes
app.use(globalRateLimiter);

// Health check endpoint
app.get(['/', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'JB51 Store API',
    timestamp: new Date().toISOString(),
    trpcEndpoint: `http://localhost:${port}/trpc`,
  });
});

// REST API endpoints with specialized upload rate limiting
app.use('/api', uploadRateLimiter, uploadRouter);

// tRPC request handler middleware with procedure rate limiting
app.use(
  '/trpc',
  trpcRateLimiter,
  createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

app.listen(port, () => {
  console.log(`\n🚀 JB51 Store API server running on http://localhost:${port}`);
  console.log(`📡 tRPC endpoint available at http://localhost:${port}/trpc\n`);
});
