import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

export const createDbClient = (connectionString?: string) => {
  const url = connectionString || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/jb51_store';
  const queryClient = postgres(url);
  return drizzle(queryClient, { schema });
};

export const client = postgres(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/jb51_store'
);

export const db = drizzle(client, { schema });

export type Database = typeof db;
