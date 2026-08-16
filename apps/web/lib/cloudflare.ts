import { getOrCreateAls } from "vinext/shims/internal/als-registry";

const als = getOrCreateAls<CloudflareEnv>("web.cloudflareEnv.als");

export function runWithCloudflareEnv<T>(
  env: CloudflareEnv,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return als.run(env, fn);
}

export function getCloudflareEnv(): CloudflareEnv | null {
  return als.getStore() ?? null;
}
