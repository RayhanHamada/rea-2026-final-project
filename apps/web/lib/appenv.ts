import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const appenv = createEnv({
  server: {
    NODE_ENV: v.optional(
      v.picklist(["development", "test", "production"]),
      "development"
    ),
    BETTER_AUTH_SECRET: v.pipe(v.string(), v.nonEmpty()),
    BETTER_AUTH_URL: v.pipe(v.string(), v.nonEmpty(), v.url()),
    GOOGLE_CLIENT_ID: v.string(),
    GOOGLE_CLIENT_SECRET: v.string(),

    R2_ENDPOINT: v.pipe(v.string(), v.nonEmpty()),
    R2_ACCESS_KEY_ID: v.pipe(v.string(), v.nonEmpty()),
    R2_SECRET_ACCESS_KEY: v.pipe(v.string(), v.nonEmpty()),
    R2_BUCKET: v.pipe(v.string(), v.nonEmpty()),
  },

  client: {},
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
