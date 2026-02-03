import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Dangerously allow production builds with TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
