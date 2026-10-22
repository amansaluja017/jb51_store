import rateLimit, { Options, RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

export interface RateLimiterOptions extends Partial<Options> {
  windowMs?: number;
  max?: number | ((req: Request, res: Response) => number | Promise<number>);
  message?: any;
  statusCode?: number;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

/**
 * Creates a configured Express rate limiting middleware.
 */
export function createRateLimiter(options: RateLimiterOptions = {}): RateLimitRequestHandler {
  const windowMs = options.windowMs ?? (process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000); // 15 minutes default
  const max = options.max ?? (process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 500); // 500 requests per windowMs default

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return standard `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    statusCode: options.statusCode ?? 429,
    message: options.message ?? {
      status: 429,
      error: 'Too many requests. Please try again later.',
      code: 'TOO_MANY_REQUESTS',
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    },
    // Don't rate limit OPTIONS pre-flight requests
    skip: (req: Request) => req.method === 'OPTIONS',
    ...options,
  });
}

/**
 * Global rate limiter applied across all routes.
 * Standard protection: 500 requests per 15-minute window per IP.
 */
export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    status: 429,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    code: 'TOO_MANY_REQUESTS',
  },
});

/**
 * Stricter rate limiter for authentication routes (login, admin verification).
 * Prevents brute-force attempts: 15 requests per 15-minute window per IP.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    status: 429,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Rate limiter for heavy media / asset upload endpoints.
 * 60 uploads per 15-minute window per IP.
 */
export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    status: 429,
    error: 'Too many file uploads. Please wait before uploading more assets.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Dedicated rate limiter for tRPC procedure calls.
 * 400 procedures per 15-minute window per IP.
 */
export const trpcRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 400,
  message: {
    status: 429,
    error: 'Too many API requests. Please slow down.',
    code: 'TRPC_RATE_LIMIT_EXCEEDED',
  },
});

export default globalRateLimiter;
