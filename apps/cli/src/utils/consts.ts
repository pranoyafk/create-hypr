import { fileURLToPath } from "node:url";
import * as path from "node:path";

export const execPrefix = {
  pnpm: "pnpx",
  bun: "bunx --bun",
};

export const bunfigContent = '[install]\nlinker = "isolated"';
export const pnpmWorkspaceContent = "packages:\n - apps/*\n - packages/*";

/**
 * Get the absolute path to the templates directory
 * Uses ES modules URL resolution for reliable path handling across different environments
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const TEMPLATE_DIR = path.resolve(__dirname, "../templates");
