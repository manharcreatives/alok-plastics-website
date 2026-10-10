import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/* `npm run dev` (port 3000) has no PHP, so the admin panel, the API and the data the panel writes
   (careers.json, products.json, uploads) are proxied to the PHP server from `npm run admin`
   (port 8080). Without this, roles and products added in the admin never show on the dev site and
   login / cart / enquiry calls fail. Dev only: the static export (`next build`) is unaffected. */
const PHP_ORIGIN = process.env.PHP_ORIGIN || 'http://127.0.0.1:8080';
const devProxy = process.env.NODE_ENV === 'development';

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

  ...(devProxy && {
    async rewrites() {
      return [
        { source: '/data/:path*', destination: `${PHP_ORIGIN}/data/:path*` },
        { source: '/api/:path*', destination: `${PHP_ORIGIN}/api/:path*` },
        { source: '/admin', destination: `${PHP_ORIGIN}/admin/` },
        { source: '/admin/:path*', destination: `${PHP_ORIGIN}/admin/:path*` },
      ];
    },
  }),

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

};

export default withBundleAnalyzer(nextConfig);
