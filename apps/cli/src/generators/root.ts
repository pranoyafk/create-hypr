import { execPrefix } from "../utils/consts";
import type { IConfig, PackageJson } from "../utils/types";

export function generateRootPackageJson(config: IConfig) {
  const packageJson: PackageJson = {
    name: config.name,
    private: true,
    version: "0.0.0",
    scripts: {
      build: "turbo run build",
      dev: "turbo run dev",
      lint: `${execPrefix[config.packageManager]} biome lint`,
      format: `${execPrefix[config.packageManager]} biome format --write`,
      check: `${execPrefix[config.packageManager]} biome check --write`,
      "db:generate": `${config.packageManager} --filter @hypr-stack/db generate`,
      "db:migrate": `${config.packageManager} --filter @hypr-stack/db migrate`,
      "db:push": `${config.packageManager} --filter @hypr-stack/db push`,
      "db:pull": `${config.packageManager} --filter @hypr-stack/db pull`,
      "db:check": `${config.packageManager} --filter @hypr-stack/db check`,
      "db:up": `${config.packageManager} --filter @hypr-stack/db up`,
      "db:studio": `${config.packageManager} --filter @hypr-stack/db studio`,
      "ui:add": `${config.packageManager} --filter @hypr-stack/ui run add`,
      "ui:refresh": `${config.packageManager} --filter @hypr-stack/ui run refresh`,
    },
    devDependencies: {
      "@biomejs/biome": "2.2.2",
      "@types/node": "^20.11.17",
      turbo: "^2.5.6",
      typescript: "5.9.2",
    },
    packageManager: "pnpm@10.15.0",
    engines: {
      node: ">=20",
    },
  };

  if (config.packageManager === "bun") {
    packageJson.workspaces = ["apps/*", "packages/*"];
    // Bun does't support this field.
    delete packageJson.packageManager;
  }

  return packageJson;
}
