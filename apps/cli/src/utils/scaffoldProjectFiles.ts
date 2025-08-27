import * as path from "node:path";
import * as fs from "fs-extra";
import {
  generateDrizzleConfig,
  generateDrizzlePackageJson,
  generateRootPackageJson,
  generateUiPackageJson,
} from "../generators";
import { generateEnvFiles, generateServerEnvFile } from "../generators/env";
import { generateServerAuthConfig } from "../generators/server-auth";
import { TEMPLATE_DIR } from "./consts";
import type { IConfig } from "./types";

/**
 * Sets up the complete project structure with all necessary files and configurations
 *
 * @param projectDirectory - Absolute path where the project should be created
 * @param userConfig - Complete project configuration from user prompts
 */
export async function scaffoldProjectFiles(projectDirectory: string, userConfig: IConfig) {
  // Copy templates
  await fs.copy(path.join(TEMPLATE_DIR, "base"), projectDirectory);
  await fs.copy(path.join(TEMPLATE_DIR, `extras/${userConfig.frontend}`), projectDirectory);
  await fs.copy(path.join(TEMPLATE_DIR, `extras/${userConfig.database}`), projectDirectory);

  // Package.json generation
  await generateRootPackageJson(projectDirectory, userConfig.packageManager);
  await generateDrizzlePackageJson(
    projectDirectory,
    userConfig.packageManager,
    userConfig.database,
  );
  await generateUiPackageJson(projectDirectory, userConfig.packageManager);

  // Configuration file generation
  await generateDrizzleConfig(projectDirectory, userConfig.database);
  await generateEnvFiles(projectDirectory, userConfig.database);
  await generateServerEnvFile(projectDirectory, userConfig.database);
  await generateServerAuthConfig(projectDirectory, userConfig.database);
}
