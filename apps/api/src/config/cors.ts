import { CorsOptions } from 'cors';

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:19006',
  'http://localhost:8081',
];

/**
 * Parses client URLs from environment variable CLIENT_URL (comma-separated)
 */
function getEnvOrigins(): string[] {
  if (!process.env.CLIENT_URL) return [];
  return process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean);
}

/**
 * Checks whether an origin is allowed:
 * - Matching configured allowed origins or env CLIENT_URL
 * - Localhost / 127.0.0.1
 * - Private LAN IP addresses (10.x, 192.168.x, 172.16-31.x) for mobile Expo/device testing
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)

  const allowedOrigins = [...defaultAllowedOrigins, ...getEnvOrigins()];
  if (allowedOrigins.includes(origin)) return true;

  // Local development hostnames
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    return true;
  }

  // Private network IP regex for mobile devices on local WiFi
  const privateIpRegex = /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
  if (privateIpRegex.test(origin)) {
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
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
};
