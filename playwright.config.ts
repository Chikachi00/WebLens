import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const localChromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const localChromiumExecutable = process.platform === "win32" && existsSync(localChromePath) ? localChromePath : undefined;

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: localChromiumExecutable ? { executablePath: localChromiumExecutable } : undefined
      }
    }
  ]
});
