import * as path from "node:path";
import * as p from "@clack/prompts";
import { execa } from "execa";
import * as fs from "fs-extra";
import { bunfigContent, pnpmWorkspaceContent } from "./consts";
import { scaffoldProjectFiles } from "./scaffoldProjectFiles";
import type { IConfig, TCreateProjectReturn } from "./types";

/**
 * Creates a new Hypr Stack project based on user configuration
 *
 * @param userConfig - Complete project configuration from user prompts
 * @returns Promise resolving to success/failure result with error details
 */
export async function createProject(userConfig: IConfig): Promise<TCreateProjectReturn> {
  const spinner = p.spinner();
  // Convert project name to absolute target directory path
  const projectDirectory = path.join(process.cwd(), userConfig.name);

  try {
    // Ensure target directory exists (creates if missing)
    await fs.ensureDir(projectDirectory);

    // Check if directory is empty and prompt user for confirmation if not
    // This prevents accidentally overwriting existing projects
    const files = await fs.readdir(projectDirectory);
    if (files.length > 0) {
      const shouldContinue = await p.confirm({
        message: `Directory ${userConfig.name} already exists and is not empty. Continue?`,
        initialValue: false,
      });

      // User declined to continue with non-empty directory
      if (!shouldContinue) {
        return { success: false, error: "Directory already exists" };
      }
    }

    // Project scaffolding
    spinner.start("Creating your Hypr Stack project...");

    // Scaffold project files
    spinner.message("Scaffolding project files...");
    await scaffoldProjectFiles(projectDirectory, userConfig);

    // Add package manager specific configuration files
    // These files control workspace behavior and package resolution
    if (userConfig.packageManager === "bun") {
      await fs.writeFile(path.join(projectDirectory, "bunfig.toml"), bunfigContent);
    } else {
      await fs.writeFile(path.join(projectDirectory, "pnpm-workspace.yaml"), pnpmWorkspaceContent);
    }

    // Dependencies installation
    if (userConfig.installDependencies) {
      try {
        spinner.message("Installing dependencies...");
        await execa(userConfig.packageManager, ["install"], {
          cwd: projectDirectory,
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
    console.debug(error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
