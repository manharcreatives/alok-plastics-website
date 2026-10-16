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
  // Admin product photos are shrunk in the browser first; 4 MB stays under the host's request limit.
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
    // The public site and the admin have separate root layouts, so unmatched URLs use app/global-not-found.tsx.
    globalNotFound: true,
  },

  // The GST invoice PDF reads the UPI QR image from disk.
  outputFileTracingIncludes: {
    '/admin/orders/[id]/pdf': ['./public/brand/upiqr.png'],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

};

export default withBundleAnalyzer(nextConfig);
