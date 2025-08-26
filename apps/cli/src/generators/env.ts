import * as path from "node:path";
import * as fs from "fs-extra";
import type { TDatabase } from "../utils/types";

export async function generateEnvFiles(targetDir: string, database: TDatabase) {
  const databaseUrl = {
    sqlite: "file:local.db",
    mysql: "mysql://root:password@localhost:3306/db-name",
    postgres: "postgres://postgres:password@localhost:5432/db-name",
  };
  const serverEnv = [
    "# Server environment variables (never exposed to client)",
    `DATABASE_URL=${databaseUrl[database]}`,
    "BETTER_AUTH_SECRET=your-auth-secret # Generate with: openssl rand -base64 32",
    "BETTER_AUTH_URL=http://localhost:8000",
    "NODE_ENV=development",
    "CORS_ORIGIN=http://localhost:3000",
  ];
  const clientEnv = [
    "# Client environment variables (exposed to browser)",
    "# Must be prefixed with VITE_ to be accessible in the client",
    "VITE_SERVER_URL=http://localhost:8000",
  ];

  await fs.writeFile(path.join(targetDir, ".env"), clientEnv.join("\n"));
  await fs.writeFile(path.join(targetDir, ".env"), serverEnv.join("\n"));
  // .env.example not ignored by git
  await fs.writeFile(path.join(targetDir, ".env.example"), clientEnv.join("\n"));
  await fs.writeFile(path.join(targetDir, ".env.example"), serverEnv.join("\n"));
}
