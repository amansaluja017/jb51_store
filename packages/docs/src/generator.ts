import type { AnyRouter } from '@trpc/server';
import type {
  OpenApiDocument,
  OpenApiOperation,
  OpenApiPaths,
  OpenApiTag,
  GeneratorOptions,
} from './types.js';
import { zodToJsonSchema } from './schema-converter.js';

/**
 * Known default descriptions for common subrouters.
 */
const DEFAULT_TAG_DESCRIPTIONS: Record<string, string> = {
  Auth: 'User authentication, registration, JWT sessions, tokens, and credentials',
  Products: 'Storefront catalogue, product discovery, search, tags, and admin CRUD',
  Reviews: 'Customer reviews, ratings, approval workflow, and moderation',
  Inventory: 'Stock levels, variant tracking, buy/sell transactions, and alerts',
  Customers: 'Customer database, contact profiles, CRM metrics, and order history',
  Orders: 'Customer orders, invoices linkage, order items, and status tracking',
  Invoices: 'GST invoices, payment modes (Cash, Online, Credit), and billing',
  Credits: 'Khata ledger, customer debt management, payment logs, and overdue tracking',
  Analytics: 'E-commerce telemetry, conversion funnels, catalogue traffic, and demand pulse',
  Inquiries: 'Customer inquiries, web contact requests, and support routing',
  Wishlist: 'Device fingerprint and user-based wishlist synchronization',
  SiteConfig: 'Dynamic storefront UI content, hero slides, sales banners, and revalidation',
  'Site Config': 'Dynamic storefront UI content, hero slides, sales banners, and revalidation',
  System: 'System health check and operational endpoints',
  Uploads: 'Multipart media and product image upload, validation & Cloudinary management',
};

/**
 * Converts a camelCase or kebab-case name into capitalized words.
 * e.g. "siteConfig" -> "Site Config", "getBySlug" -> "Get By Slug"
 */
function toWords(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a procedure key into a clean summary title.
 * e.g. "auth.register" -> "Register", "products.getPaginated" -> "Get Paginated"
 */
function formatProcedureSummary(key: string): string {
  const parts = key.split('.');
  const action = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
  return toWords(action);
}

/**
 * Determines tag name from procedure key.
 * e.g. "auth.login" -> "Auth", "siteConfig.get" -> "Site Config"
 */
function formatTagName(key: string): string {
  const parts = key.split('.');
  if (parts.length <= 1) return 'System';
  return toWords(parts[0]);
}

/**
 * Automatically inspects a tRPC router and builds a complete OpenAPI 3.1.0 document.
 * As procedures are added to the router, they are immediately included in the output!
 */
export function generateOpenApiDocument(options: GeneratorOptions): OpenApiDocument {
  const {
    router,
    info = {},
    servers = [
      { url: 'http://localhost:3001', description: 'Local Development Server' },
      { url: '/', description: 'Current Origin / Production Proxy' },
    ],
    trpcBasePath = '/trpc',
    extraPaths = {},
    tags: customTags = [],
    components = {},
  } = options;

  const paths: OpenApiPaths = {};
  const discoveredTags = new Set<string>();

  // 1. Iterate over all procedures automatically from router._def.procedures
  const procedures = (router._def as { procedures: Record<string, any> }).procedures || {};

  for (const [key, procedure] of Object.entries(procedures)) {
    const def = procedure._def || {};
    const procedureType: 'query' | 'mutation' | 'subscription' = def.type || 'query';

    // Ignore subscriptions in OpenAPI HTTP specs
    if (procedureType === 'subscription') {
      continue;
    }

    const tag = formatTagName(key);
    discoveredTags.add(tag);

    const httpMethod = procedureType === 'query' ? 'get' : 'post';
    const pathKey = `${trpcBasePath}/${key}`;

    const summary = formatProcedureSummary(key);
    const description = def.meta?.description || `${summary} procedure for ${tag}.`;
    const operationId = `trpc_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const operation: OpenApiOperation = {
      tags: [tag],
      summary,
      description,
      operationId,
      responses: {},
    };

    // Check if procedure might require authentication
    const isProtected =
      key.includes('changePassword') ||
      key.includes('logout') ||
      key.includes('create') ||
      key.includes('update') ||
      key.includes('delete') ||
      key.includes('admin') ||
      key.includes('recordPayment') ||
      key.includes('recordTransaction') ||
      key.includes('revalidate');

    if (isProtected) {
      operation.security = [{ BearerAuth: [] }];
    }

    // Process inputs
    const inputs: unknown[] = def.inputs || [];
    const firstInput = inputs.length > 0 ? inputs[0] : null;

    if (firstInput) {
      const inputSchema = zodToJsonSchema(firstInput);

      if (inputSchema) {
        if (httpMethod === 'get') {
          // For queries, tRPC accepts ?input=<url-encoded-json>
          operation.parameters = [
            {
              name: 'input',
              in: 'query',
              description: 'URL-encoded JSON input parameters.',
              schema: inputSchema,
            },
          ];
        } else {
          // For mutations, requestBody in JSON
          operation.requestBody = {
            description: `${summary} payload`,
            required: true,
            content: {
              'application/json': {
                schema: inputSchema,
              },
            },
          };
        }
      }
    }

    // Process output
    let outputSchema: Record<string, unknown> | null = null;
    if (def.output) {
      outputSchema = zodToJsonSchema(def.output);
    }

    const dataSchema = outputSchema || {
      type: 'object',
      description: 'Procedure result data',
    };

    operation.responses['200'] = {
      description: 'Successful procedure execution',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              result: {
                type: 'object',
                properties: {
                  data: dataSchema,
                },
              },
            },
          },
        },
      },
    };

    operation.responses['400'] = {
      description: 'Bad request or validation error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'BAD_REQUEST' },
                  code: { type: 'integer', example: -32600 },
                },
              },
            },
          },
        },
      },
    };

    if (isProtected) {
      operation.responses['401'] = {
        description: 'Unauthorized or invalid credentials',
      };
    }

    if (!paths[pathKey]) {
      paths[pathKey] = {};
    }
    paths[pathKey][httpMethod] = operation;
  }

  // 2. Merge custom manual/REST paths
  for (const [pathKey, pathMethods] of Object.entries(extraPaths)) {
    if (!paths[pathKey]) {
      paths[pathKey] = {};
    }
    for (const [method, op] of Object.entries(pathMethods)) {
      paths[pathKey][method] = op;
      if (op.tags) {
        for (const t of op.tags) {
          discoveredTags.add(t);
        }
      }
    }
  }

  // 3. Assemble tags with descriptions
  const tagMap = new Map<string, OpenApiTag>();

  // Add discovered tags
  for (const tagName of discoveredTags) {
    tagMap.set(tagName, {
      name: tagName,
      description: DEFAULT_TAG_DESCRIPTIONS[tagName] || `${tagName} API endpoints and procedures.`,
    });
  }

  // Override with custom tags
  for (const customTag of customTags) {
    tagMap.set(customTag.name, customTag);
  }

  // Sort tags alphabetically with System and Uploads logically positioned
  const finalTags = Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // 4. Build final document
  const openApiDoc: OpenApiDocument = {
    openapi: '3.1.0',
    info: {
      title: info.title || 'JB51 Store API',
      version: info.version || '1.0.0',
      description:
        info.description ||
        `## JB51 Store API Documentation
Automatically generated OpenAPI documentation for JB51 Store backend services, REST endpoints, and tRPC procedures.
Powered by **@repo/docs** and **Scalar**.`,
      contact: info.contact || {
        name: 'JB51 Tech Team',
        email: 'tech@jb51.shop',
        url: 'https://jb51.shop',
      },
      license: info.license || {
        name: 'Proprietary',
      },
    },
    servers,
    tags: finalTags,
    paths,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Pass your JWT token: `Bearer <token>`',
        },
        ...(components.securitySchemes || {}),
      },
      schemas: {
        ...(components.schemas || {}),
      },
    },
  };

  return openApiDoc;
}
