import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  // Static export for Hostinger Premium (PHP + static hosting only — no Node.js)
  output: 'export',
  trailingSlash: true,

  // Images: pre-optimised via scripts/optimise-images.mjs — no Next.js runtime optimizer
  images: {
    unoptimized: true,
  },

  // Exclude _lab routes from the static export (dev-only)
  experimental: {
    // _lab routes are excluded at build time via generateStaticParams returning []
    // and by not including them in the sitemap
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

};

export default withBundleAnalyzer(nextConfig);
