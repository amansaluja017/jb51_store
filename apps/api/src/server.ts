import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter, createTRPCContext } from './router.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for Web and Mobile clients
app.use(
  cors({
    origin: true,
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
