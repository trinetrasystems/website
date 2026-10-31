import { defineConfig, devices } from "@playwright/test";

// Browser end-to-end tests. Runs the real app with `vite --mode e2e`, which
// replaces Firebase with the in-memory fake in e2e/fake-firebase. Calls to /api
// are intercepted per test so no real email is sent.
const PORT = 5179;

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: "../node_modules/.cache/e2e-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx vite --mode e2e --port ${PORT} --strictPort --host localhost`,
    url: `http://localhost:${PORT}/admin`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    cwd: "..",
  },
});
