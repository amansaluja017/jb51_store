import { z } from 'zod';

/**
 * Recursively cleans and unwraps Zod schemas that use .transform() pipes
 * or non-serializable constructs so they can be safely converted to JSON Schema.
 */
export function sanitizeZodSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  const def = schema.def;
  if (!def) return schema;

  // If schema is a pipe (e.g. z.object(...).transform(...))
  if (def.type === 'pipe' && def.in) {
    return sanitizeZodSchema(def.in);
  }

  // Pure transform without input schema
  if (def.type === 'transform') {
    return z.any();
  }

  // Zod Object
  if (def.type === 'object') {
    const rawShape = typeof def.shape === 'function' ? def.shape() : def.shape;
    if (rawShape) {
      const cleanShape: Record<string, any> = {};
      for (const [key, value] of Object.entries(rawShape)) {
        cleanShape[key] = sanitizeZodSchema(value);
      }
      return z.object(cleanShape);
    }
  }

  // Zod Array
  if (def.type === 'array' && def.element) {
    return z.array(sanitizeZodSchema(def.element));
  }

  // Zod Nullable
  if (def.type === 'nullable' && def.innerType) {
    return sanitizeZodSchema(def.innerType).nullable();
  }

  // Zod Optional
  if (def.type === 'optional' && def.innerType) {
    return sanitizeZodSchema(def.innerType).optional();
  }

  // Zod Union
  if (def.type === 'union' && Array.isArray(def.options)) {
    return z.union(def.options.map((opt: any) => sanitizeZodSchema(opt)) as [any, any, ...any[]]);
  }

  return schema;
}

/**
 * Safely converts any Zod schema to a clean JSON Schema object.
 * Returns null if schema is missing or invalid.
 */
export function zodToJsonSchema(schema: unknown): Record<string, unknown> | null {
  if (!schema || typeof schema !== 'object') return null;

  const target = schema as { toJSONSchema?: () => Record<string, unknown> };

  // 1. Direct conversion
  if (typeof target.toJSONSchema === 'function') {
    try {
      const res = target.toJSONSchema();
      return cleanJsonSchema(res);
    } catch {
      // Fallback to sanitization
    }
  }

  // 2. Sanitized conversion (unwraps transforms / pipes)
  try {
    const sanitized = sanitizeZodSchema(schema);
    if (sanitized && typeof sanitized.toJSONSchema === 'function') {
      const res = sanitized.toJSONSchema();
      return cleanJsonSchema(res);
    }
  } catch {
    // Return generic object definition
  }

  return { type: 'object', description: 'Dynamic payload' };
}

/**
 * Strips $schema header or draft identifiers to keep OpenAPI component clean.
 */
function cleanJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const { $schema, ...rest } = schema;
  return rest;
}
