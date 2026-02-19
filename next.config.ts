import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Inicjalizacja PWA
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // PWA jest wyłączone lokalnie, żeby nie psuć hot-reloadu
});

// 2. Twoja obecna konfiguracja (nic z niej nie usuwamy!)
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  
  // 🎯 Turbopack dla Next 16
  turbopack: {},  // Wyłącz warning
  
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
export default withPWA(nextConfig);