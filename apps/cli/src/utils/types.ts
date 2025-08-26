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

export interface IPackageJson {
  name: string;
  private: boolean;
  version: string;
  type?: "module" | "commonjs";
  exports?: Record<string, unknown>;
  scripts: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  packageManager?: string;
  engines?: Record<string, string>;
  workspaces?: string[];
}
