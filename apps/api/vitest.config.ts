import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

export default defineConfig({
  test: {
    setupFiles: ["./src/tests/setup.ts"],
    environment: "node",
    globals: true,
    include: ["src/tests/**/*.test.ts"],
  },
});
