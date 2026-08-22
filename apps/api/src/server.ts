import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter, createTRPCContext } from './router';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for Next.js frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// tRPC request handler middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
