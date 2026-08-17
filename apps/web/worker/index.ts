import handler from "vinext/server/fetch-handler";

import { runWithEnv } from "../lib/cloudflare";

export default {
  async fetch(request, env, ctx) {
    return runWithEnv(env, () => handler.fetch(request, env, ctx));
  },
} satisfies ExportedHandler<Env>;
