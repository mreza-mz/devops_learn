import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["dockerode", "ws"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
