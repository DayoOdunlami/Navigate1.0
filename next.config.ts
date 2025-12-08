import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude scripts from build compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure server-only modules - these are only used in API routes
  serverExternalPackages: ['fs', 'path'],
  // Turbopack configuration
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  webpack: (config, { isServer }) => {
    // Ensure fs module is only available on server (for non-Turbopack builds)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
