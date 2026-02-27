import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// 1. Inicjalizacja PWA (Serwist)
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

// 2. Twoja obecna, oryginalna konfiguracja
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  
  // 🎯 Turbopack dla Next 16
  turbopack: {},
  
  transpilePackages: ['three', '@react-three/fiber'],
  
  webpack(config) {
    config.module?.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext]'
      }
    })
    return config
  }
};

// 3. Eksportujemy połączoną konfigurację
export default withSerwist(nextConfig);