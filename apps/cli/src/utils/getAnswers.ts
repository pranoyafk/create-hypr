import * as p from "@clack/prompts";
import type { IConfig } from "./types";

export async function getAnswers() {
  return await p.group(
    {
      name: () =>
        p.text({
          message: "What's your project name?",
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
      packageManager: () =>
        p.select({
          message: "Select a package manager",
          options: [
            {
              value: "bun",
            },
            {
              value: "pnpm",
            },
          ],
        }) as Promise<IConfig["packageManager"]>,
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
}
