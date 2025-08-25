import type { IConfig, TCreateProjectReturn } from "./types";

export async function createProject(_config: IConfig): Promise<TCreateProjectReturn> {
  return { success: true };
}
