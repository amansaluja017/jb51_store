import type { AnyRouter } from '@trpc/server';

export interface OpenApiContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface OpenApiLicense {
  name: string;
  url?: string;
}

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenApiContact;
  license?: OpenApiLicense;
}

export interface OpenApiServer {
  url: string;
  description?: string;
}

export interface OpenApiTag {
  name: string;
  description?: string;
  externalDocs?: {
    description?: string;
    url: string;
  };
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie' | string;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: Record<string, unknown>;
  example?: unknown;
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content: Record<string, { schema: Record<string, unknown>; example?: unknown }>;
  };
  responses: Record<
    string,
    {
      description: string;
      content?: Record<string, { schema: Record<string, unknown>; example?: unknown }>;
    }
  >;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
}

export type OpenApiPaths = Record<string, Record<string, OpenApiOperation>>;

export interface OpenApiDocument {
  openapi: string;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  tags?: OpenApiTag[];
  paths: OpenApiPaths;
  components?: {
    securitySchemes?: Record<string, unknown>;
    schemas?: Record<string, unknown>;
  };
}

export interface GeneratorOptions {
  /**
   * The tRPC router to automatically generate documentation from.
   */
  router: AnyRouter;

  /**
   * OpenAPI Specification Info metadata.
   */
  info?: Partial<OpenApiInfo>;

  /**
   * Servers list for OpenAPI specification.
   */
  servers?: OpenApiServer[];

  /**
   * Base path where tRPC is mounted (defaults to '/trpc').
   */
  trpcBasePath?: string;

  /**
   * Custom manual or REST paths to merge into the generated specification.
   */
  extraPaths?: OpenApiPaths;

  /**
   * Custom tags to provide descriptions for.
   */
  tags?: OpenApiTag[];

  /**
   * Custom components (schemas, security schemes).
   */
  components?: {
    securitySchemes?: Record<string, unknown>;
    schemas?: Record<string, unknown>;
  };
}

export interface DocsRouterOptions extends GeneratorOptions {
  /**
   * Scalar theme name: 'default' | 'alternate' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace'
   */
  theme?: string;

  /**
   * Page title for the Scalar reference documentation.
   */
  pageTitle?: string;

  /**
   * Force dark mode (defaults to true).
   */
  darkMode?: boolean;
}
