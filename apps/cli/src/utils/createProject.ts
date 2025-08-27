import * as path from "node:path";
import { fileURLToPath } from "node:url";
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

/**
 * Get the absolute path to the templates directory
 * Uses ES modules URL resolution for reliable path handling across different environments
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.resolve(__dirname, "../templates");

/**
 * Executes all project scaffolding operations in parallel for better performance
 *
 * @param targetDir - Absolute path to the project directory
 * @param config - User's project configuration choices
 * @throws {Error} If any file operation fails
 */
export async function scaffoldProjectFiles(targetDir: string, config: IConfig) {
  await Promise.all([
    // Template file operations
    fs.copy(path.join(TEMPLATE_DIR, "base"), targetDir),
    fs.copy(path.join(TEMPLATE_DIR, `extras/${config.frontend}`), targetDir),
    fs.copy(path.join(TEMPLATE_DIR, `extras/${config.database}`), targetDir),

    // Package.json generation
    generateRootPackageJson(targetDir, config.packageManager),
    generateDrizzlePackageJson(targetDir, config.packageManager, config.database),
    generateUiPackageJson(targetDir, config.packageManager),

    // Configuration file generation
    generateDrizzleConfig(targetDir, config.database),
    generateEnvFiles(targetDir, config.database),
    generateServerEnvFile(targetDir, config.database),
    generateServerAuthConfig(targetDir, config.database),
  ]);
}

/**
 * Creates a new Hypr Stack project based on user configuration
 *
 * @param config - Complete project configuration from user prompts
 * @returns Promise resolving to success/failure result with error details
 */
export async function createProject(config: IConfig): Promise<TCreateProjectReturn> {
  const spinner = p.spinner();
  // Convert project name to absolute target directory path
  const targetDir = path.join(process.cwd(), config.name);

  try {
    // Ensure target directory exists (creates if missing)
    await fs.ensureDir(targetDir);

    // Check if directory is empty and prompt user for confirmation if not
    // This prevents accidentally overwriting existing projects
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      const shouldContinue = await p.confirm({
        message: `Directory ${config.name} already exists and is not empty. Continue?`,
        initialValue: false,
      });

      // User declined to continue with non-empty directory
      if (!shouldContinue) {
        return { success: false, error: "Directory already exists" };
      }
    }

    // Project scaffolding
    spinner.start("Creating your Hypr Stack project...");

    // Execute all file operations and configurations in parallel
    await scaffoldProjectFiles(targetDir, config);

    // Add package manager specific configuration files
    // These files control workspace behavior and package resolution
    if (config.packageManager === "bun") {
      await fs.writeFile(path.join(targetDir, "bunfig.toml"), bunfigContent);
    } else {
      await fs.writeFile(path.join(targetDir, "pnpm-workspace.yaml"), pnpmWorkspaceContent);
    }

    // Dependencies installation
    if (config.installDependencies) {
      try {
        spinner.message("Installing dependencies...");
        await execa(config.packageManager, ["install"], {
          cwd: targetDir,
          stdio: "pipe", // Capture output instead of streaming to console
          env: { ...process.env, NODE_ENV: "development" },
          timeout: 30000, // 30 second timeout to prevent hanging
          preferLocal: true, // Use local package manager if available
        });
        spinner.message("Dependencies installed successfully!");
      } catch {
        // Continue project creation even if dependency installation fails
        // User can manually install dependencies later
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
