import * as path from "node:path";
import * as p from "@clack/prompts";
import { execa } from "execa";
import * as fs from "fs-extra";
import {
  generateDrizzleConfig,
  generateDrizzlePackageJson,
  generateRootPackageJson,
} from "../generators";
import { generateEnvFiles } from "../generators/env";
import { generateServerAuthConfig } from "../generators/server-auth";
import { bunfigContent, pnpmWorkspaceContent } from "./consts";
import type { IConfig, TCreateProjectReturn } from "./types";

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
    const rootPackageJson = generateRootPackageJson(targetDir, config.packageManager);
    await fs.writeJSON(path.join(targetDir, "package.json"), rootPackageJson, { spaces: 2 });

    // create the drizzle package.json and config
    const drizzlePackageJson = generateDrizzlePackageJson(config.packageManager, config.database);
    const drizzleConfig = generateDrizzleConfig(config.database);
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

    // Create the .env files
    await generateEnvFiles(targetDir, config.database);
    // Create the server auth config file
    await generateServerAuthConfig(targetDir, config.database);

    if (config.installDependencies) {
      try {
        spinner.message("Installing dependencies...");
        await execa(config.packageManager, ["install"], {
          cwd: targetDir,
          stdio: "pipe",
          env: { ...process.env, NODE_ENV: "development" },
          timeout: 30000,
          preferLocal: true,
        });
        spinner.message("Dependencies installed successfully!");
      } catch {
        spinner.message("Failed to install dependencies!");
      }
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
