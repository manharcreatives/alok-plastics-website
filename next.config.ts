import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  trailingSlash: true,

  // Images: pre-optimised via scripts/optimise-images.mjs — no Next.js runtime optimizer
  images: {
    unoptimized: true,
  },


  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

};

export default withBundleAnalyzer(nextConfig);
