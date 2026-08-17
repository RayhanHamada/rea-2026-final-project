import { createEnv } from "@t3-oss/env-nextjs";

export const appenv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: {
    ...process.env,
  },
  server: {},
  client: {},
  shared: {},
});
