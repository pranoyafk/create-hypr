export type TFrontend = "tanstack-router" | "tanstack-start";
export type TDatabase = "postgres" | "sqlite" | "mysql";

export type TCreateProjectReturn =
  | {
      success: true;
    }
  | { success: false; error: string };

export interface IConfig {
  name: string;
  frontend: TFrontend;
  database: TDatabase;
  installDependencies: boolean;
}
