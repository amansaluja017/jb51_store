import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

if (!process.env.DATABASE_URL) {
  dotenv.config();
}
if (!process.env.DATABASE_URL) {
  try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    dotenv.config({ path: path.resolve(currentDir, '../.env') });
    if (!process.env.DATABASE_URL) {
      dotenv.config({ path: path.resolve(currentDir, '../../../.env') });
    }
    if (!process.env.DATABASE_URL) {
      dotenv.config({ path: path.resolve(currentDir, '../../../apps/api/.env') });
    }
  } catch (_) {}
}

const getDatabaseUrl = (connectionString?: string): string => {
  const url = connectionString || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured. Please set DATABASE_URL in environment variables.');
  }
  return url;
};

export const createDbClient = (connectionString?: string) => {
  const url = getDatabaseUrl(connectionString);
  const queryClient = postgres(url, { prepare: false });
  return drizzle(queryClient, { schema });
};

export const client = postgres(getDatabaseUrl(), { prepare: false });

export const db = drizzle(client, { schema });

export type Database = typeof db;
