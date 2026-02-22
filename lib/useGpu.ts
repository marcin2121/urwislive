'use client';

import { useState, useEffect } from 'react';

export function useGpuAcceleration() {
  // Domyślnie zakładamy, że użytkownik MA przyspieszenie,
  // aby uniknąć "mrugania" elementów podczas ładowania strony.
  const [hasGpu, setHasGpu] = useState(true);

  useEffect(() => {
    const checkGpu = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || 
                   canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null;

        // Jeśli kontekst się nie utworzył przez brak wydajności
        if (!gl) return false;

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          // Wykrywanie renderowania programowego (CPU zamiast GPU)
          if (
            renderer.includes('software') || 
            renderer.includes('swiftshader') || 
            renderer.includes('llvmpipe')
          ) {
            return false;
          }
        }
        return true;
      } catch (e) {
        return false; // W razie błędu zakładamy najgorsze
      }
    };

    setHasGpu(checkGpu());
  }, []);

  return hasGpu;
}