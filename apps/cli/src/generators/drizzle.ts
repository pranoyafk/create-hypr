import type { IConfig, IPackageJson, TDatabase } from "../utils/types";

export function generateDrizzleConfig(config: IConfig) {
  return `
  import { env } from "@hypr-stack/env/server";
  import { defineConfig } from "drizzle-kit";

  export default defineConfig({
    out: "./drizzle",
    schema: "./src/schema/index.ts",
    dialect: "${config.database}",
    dbCredentials: {
      url: env.DATABASE_URL,
    },
  });

  `;
}

export function generateDrizzlePackageJson(config: IConfig) {
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
      generate: `${config.packageManager} drizzle-kit generate`,
      migrate: `${config.packageManager} drizzle-kit migrate`,
      push: `${config.packageManager} drizzle-kit push`,
      pull: `${config.packageManager} drizzle-kit pull`,
      check: `${config.packageManager} drizzle-kit check`,
      up: `${config.packageManager} drizzle-kit up`,
      studio: `${config.packageManager} drizzle-kit studio`,
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
    ...dbDependencies[config.database],
  };

  return packageJson;
}
