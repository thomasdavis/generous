import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
    testTimeout: 120000, // 2 minutes for LLM tests
    hookTimeout: 30000,
    // Run API tests sequentially to avoid race conditions
    sequence: {
      shuffle: false,
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
