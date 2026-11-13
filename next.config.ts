import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep `next dev` from writing an AGENTS.md into the project.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
