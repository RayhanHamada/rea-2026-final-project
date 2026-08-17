import { toNextJsHandler } from "better-auth/next-js";

import { createAuth } from "@/lib/auth";
import { getStore } from "@/lib/cloudflare";

export const { GET, POST, DELETE, PATCH, PUT } = toNextJsHandler((request) => {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }
  return createAuth(env).handler(request);
});
