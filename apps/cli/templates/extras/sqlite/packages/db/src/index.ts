import * as path from "node:path";
import { env } from "@hypr-stack/env/server";
import { type Client, createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbPath = path.resolve(process.cwd(), "../../local.db"); // Ensures root-level file

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client = globalForDb.client ?? createClient({ url: `file:${dbPath}` });
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
