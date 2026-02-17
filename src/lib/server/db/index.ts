import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

<<<<<<< HEAD
const sqlite = new Database(env.DATABASE_URL);
export const db = drizzle(sqlite, { schema });
=======
// Remove 'file:' prefix if present (common in Drizzle/SQLite connection strings)
// but incompatible with better-sqlite3 constructor in some environments
const connectionString = env.DATABASE_URL.startsWith('file:') 
    ? env.DATABASE_URL.slice(5) 
    : env.DATABASE_URL;

const client = new Database(connectionString);

export const db = drizzle(client, { schema });
>>>>>>> 953d26aa71f680de28a3bec13d18486a253e4eb0
