import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Path aliases come from tsconfig.json, so `@/...` resolves the same in tests.
  resolve: {
    tsconfigPaths: true,
    // `server-only` throws outside a React Server Components bundle; tests run
    // server code directly in Node, which is exactly what it guards.
    alias: { "server-only": fileURLToPath(new URL("./src/test/empty-module.ts", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
