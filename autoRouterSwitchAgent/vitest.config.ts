import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: [join(projectRoot, "tests", "setup-sandbox.ts")],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    env: {
      NODE_ENV: "test",
    },
  },
});
