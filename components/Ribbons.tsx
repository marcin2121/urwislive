'use client'

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useGpuAcceleration } from '@/lib/useGpu';

const RibbonsInner = dynamic(() => import('./RibbonsInner'), {
  ssr: false,
});

interface RibbonsProps {
  colors?: string[];
  baseSpring?: number;
  baseFriction?: number;
  baseThickness?: number;
  offsetFactor?: number;
  maxAge?: number;
  pointCount?: number;
  speedMultiplier?: number;
  enableFade?: boolean;
  enableShaderEffect?: boolean;
  effectAmplitude?: number;
  backgroundColor?: number[];
}

// --- WRAPPER Z DYNAMICZNYMI KOLORAMI ---
export function RibbonsBg({ colors: overrideColors }: RibbonsProps) {
  const hasGpu = useGpuAcceleration();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeColors = useMemo(() => {
    if (overrideColors && overrideColors.length > 0) {
      return overrideColors;
    }
    if (pathname?.includes('salazabaw')) {
      return ['#ffc2d1', '#a2d2ff']; 
    }
    return ['#BF2024', '#0055ff'];
  }, [pathname, overrideColors]);

  if (!hasGpu || isMobile) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-white">
      <RibbonsInner
        key={pathname}
        colors={activeColors}
        baseSpring={0.05}
        baseFriction={0.9}
        baseThickness={30}
        offsetFactor={0.05}
        pointCount={50}
        enableFade={false}
        enableShaderEffect={false}
        effectAmplitude={5.5}
      />
    </div>
  );
}