# @repo/docs

Automatic OpenAPI 3.1.0 generator and Scalar API documentation package for tRPC and Express.

## Features

- **Zero Manual Route Writing**: Inspects your tRPC routers (`_def.procedures`) at runtime to automatically discover all procedures (queries, mutations), tags, summaries, descriptions, input schemas, output schemas, and security requirements.
- **Dynamic & Real-Time**: As soon as any procedure is added to any router, it is automatically documented and rendered in the Scalar documentation UI without any manual edits.
- **Safe Zod to JSON Schema Conversion**: Safely processes and unwraps Zod schemas, transforms, pipes, optionals, and nullables.
- **Interactive Scalar UI**: Embeds `@scalar/express-api-reference` with modern themes, dark mode, client code generation, and interactive test requests.
- **REST & Custom Path Support**: Allows merging custom REST endpoints (e.g. file uploads, health checks) alongside tRPC procedures.

## Usage

```typescript
import { createDocsRouter } from '@repo/docs';
import { appRouter } from './router.js';

export const docsRouter = createDocsRouter({
  router: appRouter,
  info: {
    title: 'JB51 Store API',
    version: '1.0.0',
    description: 'Dynamic API Documentation',
  },
  theme: 'deepSpace',
  pageTitle: 'API Documentation',
});

// In Express app:
app.use('/docs', docsRouter);
```
