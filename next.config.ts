import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lecewkulki.eu',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },

  turbopack: {},

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // Usunięte na rzecz CSP frame-ancestors
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' http://localhost:3000 https://molendadevelopment.pl" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};


export default withAnalyzer(withSerwist(nextConfig));
