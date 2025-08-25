import * as p from "@clack/prompts";
import type { IConfig, TCreateProjectReturn } from "./types";

export async function createProject(_config: IConfig): Promise<TCreateProjectReturn> {
  const spinner = p.spinner();

  try {
    spinner.start("Creating your Hypr Stack project...");

    spinner.stop("Project created successfully!");
    return { success: true };
  } catch (error) {
    spinner.stop("Failed to create project");

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
