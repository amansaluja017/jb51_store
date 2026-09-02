import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter, createTRPCContext } from './router.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19006'];

// Enable CORS for Web and Mobile clients
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get(['/', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'JB51 Store API',
    timestamp: new Date().toISOString(),
    trpcEndpoint: `http://localhost:${port}/trpc`,
  });
});

// tRPC request handler middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

app.listen(port, () => {
  console.log(`\n🚀 JB51 Store API server running on http://localhost:${port}`);
  console.log(`📡 tRPC endpoint available at http://localhost:${port}/trpc\n`);
});
