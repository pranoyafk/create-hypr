export type TFrontend = "tanstack-router" | "tanstack-start";
export type TDatabase = "postgres" | "sqlite" | "mysql";
export type TPackageManager = "pnpm" | "bun";

export type TCreateProjectReturn =
  | {
      success: true;
    }
  | { success: false; error: string };

export interface IConfig {
  name: string;
  frontend: TFrontend;
  database: TDatabase;
  packageManager: TPackageManager;
  installDependencies: boolean;
}
