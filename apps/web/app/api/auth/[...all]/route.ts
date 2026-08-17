import { toNextJsHandler } from "better-auth/next-js";

import { createAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";

export const { GET, POST, DELETE, PATCH, PUT } = toNextJsHandler((request) => {
  const env = getEnv();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }
  return createAuth(env).handler(request);
});
