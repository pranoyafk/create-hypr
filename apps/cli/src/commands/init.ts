import * as p from "@clack/prompts";
import * as fs from "fs-extra";
import { createProject } from "../utils/createProject";
import type { IConfig } from "../utils/types";

export async function init() {
  p.intro("🚀 Welcome to Hypr Stack! Let's scaffold your project.");
  const answers = await p.group(
    {
      name: () =>
        p.text({
          message: "What's your project name?",
          validate: (value: string) => {
            if (value.length === 0) return "⚠️ Project name is required";
            if (fs.pathExistsSync(value)) {
              return `A folder named "${value}" already exists. Please choose a different name.`;
            }
          },
        }) as Promise<IConfig["name"]>,

      frontend: () =>
        p.select({
          message: "Choose a frontend framework",
          options: [
            {
              value: "tanstack-router",
              label: "TanStack Router - client-side rendering",
            },
            {
              value: "tanstack-start",
              label: "TanStack Start - server-side rendering",
            },
          ],
        }) as Promise<IConfig["frontend"]>,
      database: () =>
        p.select({
          message: "Select a database",
          options: [
            {
              value: "postgres",
              label: "Postgres",
            },
            {
              value: "sqlite",
              label: "Sqlite",
            },
            {
              value: "mysql",
              label: "MySql",
            },
          ],
        }) as Promise<IConfig["database"]>,
      installDependencies: () =>
        p.confirm({
          message: "Install dependencies after setup?",
          initialValue: true,
        }) as Promise<IConfig["installDependencies"]>,
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  try {
    console.log(answers);
    const projectCreation = await createProject(answers);

    if (!projectCreation.success) {
      p.cancel(`❌ Failed to create project: ${projectCreation.error}`);
      return;
    }

    p.outro("✅ Your Hypr Stack project is ready to go!");
  } catch (err) {
    p.cancel(`Unexpected error: ${(err as Error).message}`);
  }
}
