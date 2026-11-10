import { CorsOptions } from 'cors';

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:19006',
  'http://localhost:8081',
];

const productionAllowedOrigins = [
  'https://jb51.shop',
  'https://www.jb51.shop',
  'https://api.jb51.shop',
];

/**
 * Parses allowed origins from environment variables (comma-separated)
 */
function getEnvOrigins(): string[] {
  const envSources = [
    process.env.CLIENT_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS,
  ];

  const origins: string[] = [];
  for (const src of envSources) {
    if (src) {
      origins.push(...src.split(',').map((url) => url.trim().replace(/\/$/, '')).filter(Boolean));
    }
  }
  return origins;
}

/**
 * Checks whether an origin is allowed:
 * - Matching configured allowed origins or env CLIENT_URL / NEXT_PUBLIC_SITE_URL
 * - Official production domains (jb51.shop, www.jb51.shop)
 * - Vercel preview deployment URLs (*.vercel.app)
 * - Localhost / 127.0.0.1
 * - Private LAN IP addresses (10.x, 192.168.x, 172.16-31.x) for mobile Expo/device testing
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)

  // Normalize origin by stripping trailing slash
  const cleanOrigin = origin.replace(/\/$/, '');

  const allowedOrigins = [
    ...defaultAllowedOrigins,
    ...productionAllowedOrigins,
    ...getEnvOrigins(),
  ];

  if (allowedOrigins.includes(cleanOrigin)) {
    return true;
  }

  // Allow Vercel preview deployments (e.g. jb51-store-git-feat-xxx.vercel.app)
  const vercelPreviewRegex = /^https:\/\/[a-zA-Z0-9-_.]+\.vercel\.app$/;
  if (vercelPreviewRegex.test(cleanOrigin)) {
    return true;
  }

  // Local development hostnames
  if (cleanOrigin.startsWith('http://localhost') || cleanOrigin.startsWith('http://127.0.0.1')) {
    return true;
  }

  // Private network IP regex for mobile devices on local WiFi
  const privateIpRegex = /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
  if (privateIpRegex.test(cleanOrigin)) {
    return true;
  }

  // In non-production environments, remain permissive for mobile dev
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      // Do not throw an Error here as that results in a 500 Internal Server Error in Express.
      // Returning callback(null, false) instructs CORS to omit Access-Control-Allow-Origin safely.
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-trpc-source',
    'baggage',
    'sentry-trace',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};
