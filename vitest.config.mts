import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Components are rendered to static HTML with react-dom/server, so they need no DOM.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
