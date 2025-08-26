import { execPrefix } from "../utils/consts";
import type { IConfig, IPackageJson, TPackageManager } from "../utils/types";

export function generateRootPackageJson(targetDir: string, packageManager: TPackageManager) {
  const packageJson: IPackageJson = {
    name: targetDir,
    private: true,
    version: "0.0.0",
    scripts: {
      build: "turbo run build",
      dev: "turbo run dev",
      lint: `${execPrefix[packageManager]} biome lint`,
      format: `${execPrefix[packageManager]} biome format --write`,
      check: `${execPrefix[packageManager]} biome check --write`,
      "db:generate": `${packageManager} --filter @hypr-stack/db generate`,
      "db:migrate": `${packageManager} --filter @hypr-stack/db migrate`,
      "db:push": `${packageManager} --filter @hypr-stack/db push`,
      "db:pull": `${packageManager} --filter @hypr-stack/db pull`,
      "db:check": `${packageManager} --filter @hypr-stack/db check`,
      "db:up": `${packageManager} --filter @hypr-stack/db up`,
      "db:studio": `${packageManager} --filter @hypr-stack/db studio`,
      "ui:add": `${packageManager} --filter @hypr-stack/ui run add`,
      "ui:refresh": `${packageManager} --filter @hypr-stack/ui run refresh`,
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

  if (packageManager === "bun") {
    packageJson.workspaces = ["apps/*", "packages/*"];
    // Bun does't support this field.
    delete packageJson.packageManager;
  }

  return packageJson;
}
