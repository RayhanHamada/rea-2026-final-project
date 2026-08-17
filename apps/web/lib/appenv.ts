import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const appenv = createEnv({
  server: {
    NODE_ENV: v.optional(
      v.picklist(["development", "test", "production"]),
      "development"
    ),
    BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(1)),
    BETTER_AUTH_URL: v.pipe(v.string(), v.url()),
    GOOGLE_CLIENT_ID: v.string(),
    GOOGLE_CLIENT_SECRET: v.string(),
  },
  client: {},
  shared: {},
  runtimeEnv: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
