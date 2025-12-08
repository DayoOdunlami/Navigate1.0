import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude scripts from build compilation
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
