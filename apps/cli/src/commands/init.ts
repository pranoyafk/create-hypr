import * as p from "@clack/prompts";
import * as fs from "fs-extra";

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
        }),

      frontend: () =>
        p.select({
          message: "Choose a frontend framework",
          options: [
            {
              value: "router",
              label: "TanStack Router - client-side rendering",
            },
            {
              value: "start",
              label: "TanStack Start - server-side rendering",
            },
          ],
        }),
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
        }),
      installDependencies: () =>
        p.confirm({
          message: "Install dependencies after setup?",
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  console.log(answers);
  return;
}
