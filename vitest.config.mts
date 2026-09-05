import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Our logic is pure TypeScript with no DOM, so the fast Node environment is enough.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
