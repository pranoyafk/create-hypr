import * as path from "node:path";
import * as p from "@clack/prompts";
import * as fs from "fs-extra";
import type { IConfig, TCreateProjectReturn } from "./types";

const TEMPLATE_DIR = path.resolve(__dirname, "../../templates");
console.log(TEMPLATE_DIR);
export async function createProject(config: IConfig): Promise<TCreateProjectReturn> {
  const spinner = p.spinner();

  try {
    spinner.start("Creating your Hypr Stack project...");
    // create the project dir
    await fs.mkdir(config.name);

    // copy the base template
    await fs.copy(path.join(TEMPLATE_DIR, "base"), config.name);

    // copy the frontend
    await fs.copy(path.join(TEMPLATE_DIR, `extras/${config.frontend}`), config.name);

    // copy the database
    await fs.copy(path.join(TEMPLATE_DIR, `extras/${config.database}`), config.name);

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
