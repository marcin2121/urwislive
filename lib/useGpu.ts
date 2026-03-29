'use client';

import { useState } from 'react';

/** 
 * Singleton cache for GPU status to avoid redundant checks
 * across multiple components using this hook and stop re-render cascades.
 */
let cachedGpuStatus: boolean | null = null;

export function useGpuAcceleration() {
  const [hasGpu] = useState<boolean>(() => {
    // If SSR or already cached, return value immediately
    if (typeof window === 'undefined') return true;
    if (cachedGpuStatus !== null) return cachedGpuStatus;

    const checkGpu = (): boolean => {
      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || 
                   canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;

        if (!gl) return false;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          // Blacklist basic software renderers
          if (
            renderer.includes('software') || 
            renderer.includes('swiftshader') || 
            renderer.includes('llvmpipe')
          ) {
            return false;
          }
        }
        return true;
      } catch (error) {
        console.warn('GPU check failed:', error);
        return true; // Default to true to avoid over-disabling
      }
    };

    const status = checkGpu();
    cachedGpuStatus = status;
    return status;
  });

  return hasGpu;
}