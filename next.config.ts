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
  }, // ← przecinek był brakujący

  // Turbopack i webpack nie działają razem — zostaw tylko webpack
  // turbopack: {},  ← USUŃ jeśli używasz webpack poniżej

  transpilePackages: ['three', '@react-three/fiber'],

  webpack(config) {
    config.module?.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext]',
      },
    });
    return config;
  },
};

export default withSerwist(nextConfig);
