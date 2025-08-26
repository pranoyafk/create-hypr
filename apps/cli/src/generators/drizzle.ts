import * as path from "node:path";
import * as fs from "fs-extra";
import type { IPackageJson, TDatabase, TPackageManager } from "../utils/types";

export async function generateDrizzleConfig(targetDir: string, database: TDatabase) {
  const content = `
  import * as path from 'node:path';
  import { defineConfig } from "drizzle-kit";

  const dbPath = path.resolve(process.cwd(), "../../local.db") // Ensures root-level file

  export default defineConfig({
    out: "./drizzle",
    schema: "./src/schema/index.ts",
    dialect: "${database}",
    dbCredentials: {
      url: 'file:'+dbPath,
    },
  });

  `;

  await fs.writeFile(path.join(targetDir, "packages", "db", "drizzle.config.ts"), content);
}

export async function generateDrizzlePackageJson(
  targetDir: string,
  packageManager: TPackageManager,
  database: TDatabase,
) {
  const packageJson: IPackageJson = {
    name: "@hypr-stack/db",
    version: "0.0.0",
    private: true,
    type: "module",
    exports: {
      ".": {
        default: "./src/index.ts",
        types: "./src/index.ts",
        import: "./src/index.ts",
      },
      "./schema": {
        default: "./src/schema/index.ts",
        types: "./src/schema/index.ts",
        import: "./src/schema/index.ts",
      },
    },
    scripts: {
      generate: `${packageManager} drizzle-kit generate`,
      migrate: `${packageManager} drizzle-kit migrate`,
      push: `${packageManager} drizzle-kit push`,
      pull: `${packageManager} drizzle-kit pull`,
      check: `${packageManager} drizzle-kit check`,
      up: `${packageManager} drizzle-kit up`,
      studio: `${packageManager} drizzle-kit studio`,
    },
    dependencies: {
      "@hypr-stack/env": "workspace:*",
      "drizzle-orm": "^0.44.4",
    },
    devDependencies: {
      "@hypr-stack/tsconfig": "workspace:*",
      "drizzle-kit": "^0.31.4",
    },
  };

  const dbDependencies: Record<TDatabase, Record<string, string>> = {
    sqlite: { "@libsql/client": "^0.15.12" },
    postgres: { postgres: "^3.4.7" },
    mysql: { mysql2: "^3.14.3" },
  };

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...dbDependencies[database],
  };

  await fs.writeJSON(path.join(targetDir, "packages", "db", "package.json"), packageJson, {
    spaces: 2,
  });
}
