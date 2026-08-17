import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";

import ignorePatterns from "./oxlintignore.json" with { type: "json" };

export default defineConfig({
  extends: [core, react, next, tanstack, vitest],
  ignorePatterns: [...(core.ignorePatterns ?? []), ...ignorePatterns],
  rules: {
    "func-style": "off",
    "react/function-component-definition": "off",
    "require-await": "off",
    "sort-keys": "off",
  },
});
