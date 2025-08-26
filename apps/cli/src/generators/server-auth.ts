import * as path from "node:path";
import * as fs from "fs-extra";
import type { TDatabase } from "../utils/types";

export async function generateServerAuthConfig(targetDir: string, database: TDatabase) {
  const provider: Record<TDatabase, string> = {
    postgres: "pg",
    mysql: "mysql",
    sqlite: "sqlite",
  };
  const config = `import { db } from "@hypr-stack/db";
  import { env } from "@hypr-stack/env/server";
  import { betterAuth } from "better-auth";
  import { drizzleAdapter } from "better-auth/adapters/drizzle";

  export const auth = betterAuth({
    trustedOrigins: [env.CORS_ORIGIN],
    database: drizzleAdapter(db, {
      provider: "${provider[database]}",
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
  });
`;

  await fs.writeFile(path.join(targetDir, "packages", "auth", "src", "server", "auth.ts"), config);
}
