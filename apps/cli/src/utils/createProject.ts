import * as path from "node:path";
import * as p from "@clack/prompts";
import { execa } from "execa";
import * as fs from "fs-extra";
import {
  generateDrizzleConfig,
  generateDrizzlePackageJson,
  generateRootPackageJson,
  generateUiPackageJson,
} from "../generators";
import { generateEnvFiles, generateServerEnvFile } from "../generators/env";
import { generateServerAuthConfig } from "../generators/server-auth";
import { bunfigContent, pnpmWorkspaceContent } from "./consts";
import type { IConfig, TCreateProjectReturn } from "./types";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.resolve(__dirname, "../templates");

export async function createProject(config: IConfig): Promise<TCreateProjectReturn> {
  const spinner = p.spinner();
  // ensure the target dir
  const targetDir = path.join(process.cwd(), config.name);

  try {
    // create the project dir if its not exists
    await fs.ensureDir(targetDir);

    // if the targetDir already has files, ask for confirmation
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      const shouldContinue = await p.confirm({
        message: `Directory ${config.name} already exists and is not empty. Continue?`,
        initialValue: false,
      });
      if (!shouldContinue) {
        return { success: false, error: "Directory already exists" };
      }
    }

    spinner.start("Creating your Hypr Stack project...");

    // change the config.name to targetDir
    config.name = targetDir;

    // copy the base template
    await fs.copy(path.join(TEMPLATE_DIR, "base"), targetDir);

    // copy the frontend
    await fs.copy(path.join(TEMPLATE_DIR, `extras/${config.frontend}`), targetDir);

    // copy the database
    await fs.copy(path.join(TEMPLATE_DIR, `extras/${config.database}`), targetDir);

    // create the root package json
    await generateRootPackageJson(targetDir, config.packageManager);

    // create the drizzle package.json and config
    await generateDrizzlePackageJson(targetDir, config.packageManager, config.database);
    await generateDrizzleConfig(targetDir, config.database);

    // create the packages/ui package.json
    await generateUiPackageJson(targetDir, config.packageManager);

    // add package manager specifig configs
    if (config.packageManager === "bun") {
      await fs.writeFile(path.join(targetDir, "bunfig.toml"), bunfigContent);
    } else {
      await fs.writeFile(path.join(targetDir, "pnpm-workspace.yaml"), pnpmWorkspaceContent);
    }

    // Create the .env files
    await generateEnvFiles(targetDir, config.database);

    // Create server env file
    await generateServerEnvFile(targetDir, config.database);

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
