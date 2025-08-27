import * as path from "node:path";
import * as fs from "fs-extra";
import type { TDatabase } from "../utils/types";

export async function generateEnvFiles(projectDirectory: string, database: TDatabase) {
  const databaseUrl = {
    mysql: "mysql://root:password@localhost:3306/db-name",
    postgres: "postgres://postgres:password@localhost:5432/db-name",
  };
  const lines = [
    "# Server environment variables (never exposed to client)",
    "BETTER_AUTH_SECRET=your-auth-secret # Generate with: openssl rand -base64 32",
    "BETTER_AUTH_URL=http://localhost:8000",
    "NODE_ENV=development",
    "CORS_ORIGIN=http://localhost:3000",
    "",
    "# Client environment variables (exposed to browser)",
    "# Must be prefixed with VITE_ to be accessible in the client",
    "VITE_SERVER_URL=http://localhost:8000",
  ];

  if (database !== "sqlite") {
    lines[1] = `DATABASE_URL=${databaseUrl[database]}`;
  }

  await fs.writeFile(path.join(projectDirectory, ".env"), lines.join("\n"));
  await fs.writeFile(path.join(projectDirectory, ".env.example"), lines.join("\n"));
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
