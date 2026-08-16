import handler from "vinext/server/fetch-handler";

import { runWithCloudflareEnv } from "../lib/cloudflare";

export default {
  async fetch(request, env, ctx) {
    return runWithCloudflareEnv(env, () => handler.fetch(request, env, ctx));
  },
} satisfies ExportedHandler<Env>;
