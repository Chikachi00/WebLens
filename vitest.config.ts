import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    testTimeout: 10000,
    environmentOptions: {
      jsdom: {
        url: "https://example.com/"
      }
    },
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  }
});
