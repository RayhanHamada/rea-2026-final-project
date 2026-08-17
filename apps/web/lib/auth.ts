import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin, openAPI } from "better-auth/plugins";

import { appenv } from "./appenv";
import {
  ac,
  admin as adminRole,
  recruiter,
  candidate,
} from "./auth/permissions";
import { createDb } from "./db/client";

export function createAuth(env: Env) {
  const db = createDb(env);
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),

    appName: "rea-final-project",
    baseURL: appenv.BETTER_AUTH_URL,
    socialProviders: {
      google: {
        clientId: appenv.GOOGLE_CLIENT_ID,
        clientSecret: appenv.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      admin({
        ac,
        roles: {
          admin: adminRole,
          recruiter,
          candidate,
        },
      }),
      openAPI(),
    ],
  });
}
