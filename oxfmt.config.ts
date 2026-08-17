import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

import ignorePatterns from "./oxlintignore.json" with { type: "json" };

export default defineConfig({
  ...ultracite,
  ignorePatterns,
  overrides: [
    {
      files: ["wrangler.jsonc"],
      options: {
        trailingComma: "none",
      },
    },
  ],
});
