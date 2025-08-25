import * as p from "@clack/prompts";
import { createProject } from "../utils/createProject";
import { getAnswers } from "../utils/getAnswers";

export async function init() {
  p.intro("🚀 Welcome to Hypr Stack! Let's scaffold your project.");

  const answers = await getAnswers();
  const projectCreation = await createProject(answers);
  if (!projectCreation.success) {
    p.cancel(`❌ Failed to create project: ${projectCreation.error}`);
    return;
  }

  p.outro("✅ Your Hypr Stack project is ready to go!");
}
