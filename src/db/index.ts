import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const isRemoteDb = databaseUrl && !databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1");

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl || "postgresql://postgres:postgres@localhost:5432/placeholder",
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ...(isRemoteDb ? { ssl: { rejectUnauthorized: false } } : {}),
  });

globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
