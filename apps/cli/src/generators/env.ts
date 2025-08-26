import * as path from "node:path";
import * as fs from "fs-extra";
import type { TDatabase } from "../utils/types";

export async function generateEnvFiles(targetDir: string, database: TDatabase) {
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

  await fs.writeFile(path.join(targetDir, ".env"), lines.join("\n"));
  await fs.writeFile(path.join(targetDir, ".env.example"), lines.join("\n"));
}
