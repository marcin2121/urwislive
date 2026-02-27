import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // ✅ Dodaj zewnętrzne domeny obrazów
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lecewkulki.eu',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },

  turbopack: {},
  transpilePackages: ['three', '@react-three/fiber'],
};

export default withSerwist(nextConfig);
