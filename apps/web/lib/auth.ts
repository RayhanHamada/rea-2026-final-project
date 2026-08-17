import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";

import { appenv } from "./appenv";
import { createDb } from "./db/client";
import type { DbEnv } from "./db/client";

export function createAuth(env: DbEnv) {
  const db = createDb(env);
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),

    appName: "rea-final-project",
    baseURL: appenv.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: appenv.GOOGLE_CLIENT_ID ?? "",
        clientSecret: appenv.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    plugins: [openAPI()],
  });
}
