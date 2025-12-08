import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // For demo deployments: allow builds to proceed despite TS errors (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure server-only modules - these are only used in API routes
  serverExternalPackages: ['fs', 'path'],
  // Ensure Next.js uses this repo as the tracing root (avoid picking parent lockfile)
  outputFileTracingRoot: __dirname,
  // Webpack config for fallbacks (used when --webpack flag is set)
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
  // Turbopack config - empty for now, webpack handles the fallbacks
  turbopack: {},
};

export default nextConfig;
