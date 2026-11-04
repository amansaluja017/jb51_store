import { Router, type RequestHandler } from 'express';
import { apiReference } from '@scalar/express-api-reference';
import { generateOpenApiDocument } from './generator.js';
import type { DocsRouterOptions, OpenApiDocument } from './types.js';

/**
 * Creates an Express router that serves both the dynamic OpenAPI JSON
 * specification and the interactive Scalar API Reference documentation.
 *
 * It dynamically generates documentation on demand from the tRPC router,
 * ensuring any newly added procedures are instantly documented without manual edits!
 */
export function createDocsRouter(options: DocsRouterOptions): Router {
  const router: Router = Router();

  // Cache or regenerate dynamically
  let cachedDoc: OpenApiDocument | null = null;

  const getDoc = (): OpenApiDocument => {
    // If running in development, regenerate on each request so changes appear instantly
    if (process.env.NODE_ENV !== 'production' || !cachedDoc) {
      cachedDoc = generateOpenApiDocument(options);
    }
    return cachedDoc;
  };

  // Serve raw OpenAPI JSON specification
  router.get('/openapi.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(getDoc());
  });

  // Serve Scalar API reference
  const scalarHandler: RequestHandler = (req, res, next) => {
    const doc = getDoc();
    const middleware = apiReference({
      theme: (options.theme as any) || 'deepSpace',
      pageTitle: options.pageTitle || options.info?.title || 'API Documentation',
      darkMode: options.darkMode !== undefined ? options.darkMode : true,
      spec: {
        content: doc,
      },
    });
    return (middleware as any)(req, res, next);
  };

  router.use('/', scalarHandler);

  return router;
}
