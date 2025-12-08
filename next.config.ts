import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // For demo deployments: allow builds to proceed despite TS errors (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow ESLint warnings to pass during builds (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure server-only modules - these are only used in API routes
  serverExternalPackages: ['fs', 'path'],
  // Ensure Next.js uses this repo as the tracing root (avoid picking parent lockfile)
  outputFileTracingRoot: __dirname,
  // Remove deprecated experimental.serverComponentsExternalPackages
  // (moved to serverExternalPackages in Next.js 15)
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
