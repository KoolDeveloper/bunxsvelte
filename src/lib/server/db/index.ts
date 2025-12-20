import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Remove 'file:' prefix if present (common in Drizzle/SQLite connection strings)
// but incompatible with better-sqlite3 constructor in some environments
const connectionString = env.DATABASE_URL.startsWith('file:') 
    ? env.DATABASE_URL.slice(5) 
    : env.DATABASE_URL;

const client = new Database(connectionString);

export const db = drizzle(client, { schema });