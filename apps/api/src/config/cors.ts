import { CorsOptions } from 'cors';
import 'dotenv/config';

/**
 * Parses allowed origins strictly from environment variables.
 * Supported environment variables:
 * - CLIENT_URL
 * - CORS_ORIGIN / CORS_ORIGINS
 * - ALLOWED_ORIGINS
 * - FRONTEND_URL
 * - NEXT_PUBLIC_SITE_URL
 *
 * Supports:
 * - Comma or semicolon separated lists
 * - Wildcard '*' (allows any requesting origin)
 * - Wildcard patterns (e.g. 'https://*.jb51.shop', '*.vercel.app', 'http://localhost:*')
 * - Stripping surrounding quotes (' " `) and trailing slashes
 */
export function getEnvOrigins(): string[] {
  const envSources = [
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGINS,
    process.env.ALLOWED_ORIGINS,
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  const origins: string[] = [];

  for (const src of envSources) {
    if (!src) continue;
    // Strip surrounding quotes if the entire env value was quoted
    const unquoted = src.trim().replace(/^["'`]|["'`]$/g, '');
    const items = unquoted.split(/[,;]/);
    for (const item of items) {
      const cleaned = item
        .trim()
        .replace(/^["'`]|["'`]$/g, '')
        .replace(/\/+$/, '');
      if (cleaned) {
        origins.push(cleaned);
      }
    }
  }

  return Array.from(new Set(origins));
}

/**
 * Matches an incoming origin against an allowed pattern from environment variables.
 * Supports:
 * - Exact match (e.g. "https://jb51.shop" matches "https://jb51.shop")
 * - Universal wildcard ("*")
 * - Subdomain / port wildcards (e.g. "https://*.jb51.shop", "*.vercel.app", "http://localhost:*")
 */
function originMatchesPattern(origin: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (origin.toLowerCase() === pattern.toLowerCase()) return true;

  // Protocol-agnostic match (e.g. pattern "jb51.shop" matches origin "https://jb51.shop" or "http://jb51.shop")
  const originWithoutProto = origin.replace(/^https?:\/\//i, '');
  const patternWithoutProto = pattern.replace(/^https?:\/\//i, '');

  if (originWithoutProto.toLowerCase() === patternWithoutProto.toLowerCase()) {
    return true;
  }

  if (pattern.includes('*')) {
    const p = patternWithoutProto;
    const rootPattern = p.replace(/\*\./, '');
    if (rootPattern !== p && originWithoutProto.toLowerCase() === rootPattern.toLowerCase()) {
      return true;
    }
    const escaped = p.replace(/[.+?^${}()|[\]\\\/]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp('^' + escaped + '$', 'i').test(originWithoutProto);
  }

  return false;
}

/**
 * Checks whether an incoming origin is allowed based purely on environment variables.
 * - Non-browser requests (!origin) are always permitted (e.g. server-to-server, mobile app HTTP).
 * - Matches dynamically against origins configured in environment variables.
 * - In non-production environments with no env vars configured, permits all origins for development ease.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
  if (!origin) return true;

  // Clean trailing slash
  const cleanOrigin = origin.replace(/\/+$/, '');

  const envOrigins = getEnvOrigins();

  // If environment variables specify origins, check against them
  if (envOrigins.length > 0) {
    for (const pattern of envOrigins) {
      if (originMatchesPattern(cleanOrigin, pattern)) {
        return true;
      }
    }
    // Defined origins exist, but this origin didn't match any of them
    return false;
  }

  // If no environment variables are defined at all:
  // In development / local testing, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // In production with no configured origins, log a warning and block browser requests
  console.warn(
    `[CORS] Request blocked from origin "${origin}". No allowed origins defined in environment variables (CLIENT_URL, CORS_ORIGIN, ALLOWED_ORIGINS).`
  );
  return false;
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      // Returning true causes the cors middleware to reflect the incoming origin header:
      // Access-Control-Allow-Origin: <origin>
      // Access-Control-Allow-Credentials: true
      callback(null, true);
    } else {
      // Do not throw an Error as that causes Express to respond with 500.
      // Passing false omits Access-Control-Allow-Origin so the browser safely blocks cross-origin requests.
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  // Leaving allowedHeaders unset allows cors to dynamically reflect whatever
  // headers the client requests in access-control-request-headers (e.g. trpc-accept,
  // x-trpc-source, authorization, content-type).
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};
