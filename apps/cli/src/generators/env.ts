import * as path from "node:path";
import * as p from "@clack/prompts";
import { execa } from "execa";
import * as fs from "fs-extra";
import type { TDatabase } from "../utils/types";

const databaseUrl: Record<Exclude<TDatabase, "sqlite">, string> = {
  mysql: "mysql://root:password@localhost:3306/db-name",
  postgres: "postgres://postgres:password@localhost:5432/db-name",
};

async function getAuthSecret() {
  try {
    const { stdout } = await execa("openssl", ["rand", "-base64", "32"]);
    return stdout;
  } catch {
    p.log.info("Failed to generate auth secret");
    return "";
  }
}

function buildEnvContent(authSecret: string, database?: Exclude<TDatabase, "sqlite">) {
  const lines = [
    "# Server environment variables (never exposed to client)",
    `BETTER_AUTH_SECRET=${authSecret}`,
    "BETTER_AUTH_URL=http://localhost:8000",
    "NODE_ENV=development",
    "CORS_ORIGIN=http://localhost:3000",
    "",
    "# Client environment variables (exposed to browser)",
    "# Must be prefixed with VITE_ to be accessible in the client",
    "VITE_SERVER_URL=http://localhost:8000",
  ];

  if (database) {
    lines.push(`DATABASE_URL=${databaseUrl[database]}`);
  }

  return lines;
}

export async function generateEnvFiles(projectDirectory: string, database: TDatabase) {
  const authSecret = await getAuthSecret();

  const envContent = buildEnvContent(authSecret, database !== "sqlite" ? database : undefined);
  const exampleEnvContent = buildEnvContent(
    "your-auth-secret",
    database !== "sqlite" ? database : undefined,
  );
  console.log({
    envContent,
    exampleEnvContent,
  });
  await Promise.all([
    fs.writeFile(path.join(projectDirectory, ".env"), envContent.join("\n")),
    fs.writeFile(path.join(projectDirectory, ".env.example"), exampleEnvContent.join("\n")),
  ]);
}

export async function generateServerEnvFile(projectDirectory: string, database: TDatabase) {
  const content = `
import * as path from "node:path";
  import { fileURLToPath } from "node:url";
  import { createEnv } from "@t3-oss/env-core";
  import dotenv from "dotenv";
  import { z } from "zod";

  // Load .env file from the project root
  // This approach is more robust than hardcoding relative paths
  if (process.env.NODE_ENV !== "production") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dirname, "../../../.env");
    dotenv.config({ path: envPath });
  } else {
    // In production, log a warning if .env is not loaded (optional)
    if (!process.env.DATABASE_URL) {
      console.warn("Warning: DATABASE_URL not set in production environment variables.");
    }
  }

  export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
      ${database !== "sqlite" ? "DATABASE_URL: z.url()," : ""}
      CORS_ORIGIN: z.url(),
      BETTER_AUTH_URL: z.url(), // Base url of your server
      BETTER_AUTH_SECRET: z.string().min(32), // Ensure minimum length for security
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    },

    runtimeEnv: process.env,

    isServer: typeof window === "undefined",

    /**
     * Makes it so that empty strings are treated as undefined. SOME_VAR: z.string() and
     * SOME_VAR='' will throw an error.
     */
    emptyStringAsUndefined: true,

    /**
     * Skip validation in production to improve performance.
     * Set to false if you want to ensure validation in production.
     */
    skipValidation: false,
  });
`;

  await fs.writeFile(path.join(projectDirectory, "packages", "env", "src", "server.ts"), content);
}
