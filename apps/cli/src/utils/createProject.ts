import * as path from "node:path";
import * as p from "@clack/prompts";
import * as fs from "fs-extra";
import {
  generateDrizzleConfig,
  generateDrizzlePackageJson,
  generateRootPackageJson,
} from "../generators";
import type { IConfig, TCreateProjectReturn } from "./types";
import { bunfigContent, pnpmWorkspaceContent } from "./consts";

const TEMPLATE_DIR = path.resolve(__dirname, "../../templates");
console.log(TEMPLATE_DIR);
export async function createProject(config: IConfig): Promise<TCreateProjectReturn> {
  const spinner = p.spinner();

  try {
    spinner.start("Creating your Hypr Stack project...");

    // ensure the target dir
    const targetDir = path.join(process.cwd(), config.name);

    // create the project dir
    await fs.ensureDir(targetDir);

    // change the config.name to targetDir
    config.name = targetDir;

    // copy the base template
    await fs.copy(path.join(TEMPLATE_DIR, "base"), targetDir);

    // copy the frontend
    await fs.copy(path.join(TEMPLATE_DIR, `extras/${config.frontend}`), targetDir);

    // copy the database
    await fs.copy(path.join(TEMPLATE_DIR, `extras/${config.database}`), targetDir);

    // create the root package json
    const rootPackageJson = generateRootPackageJson(config);
    await fs.writeJSON(path.join(targetDir, "package.json"), rootPackageJson, { spaces: 2 });

    // create the drizzle package.json and config
    const drizzlePackageJson = generateDrizzlePackageJson(config);
    const drizzleConfig = generateDrizzleConfig(config);
    await fs.writeJSON(path.join(targetDir, "packages", "db", "package.json"), drizzlePackageJson, {
      spaces: 2,
    });
    await fs.writeFile(path.join(targetDir, "packages", "db", "drizzle.config.ts"), drizzleConfig);

    // add package manager specifig configs
    if (config.packageManager === "bun") {
      await fs.writeFile(path.join(targetDir, "bunfig.toml"), bunfigContent);
    } else {
      await fs.writeFile(path.join(targetDir, "pnpm-workspace.yaml"), pnpmWorkspaceContent);
    }

    spinner.stop("Project created successfully!");
    return { success: true };
  } catch (error) {
    spinner.stop("Failed!");

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
