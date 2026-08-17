import { getOrCreateAls } from "vinext/shims/internal/als-registry";

const als = getOrCreateAls<Env>("web.cloudflareEnv.als");

export function runWithEnv<T>(
  env: Env,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return als.run(env, fn);
}

export function getEnv(): Env | null {
  return als.getStore() ?? null;
}
