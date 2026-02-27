'use client'

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { ScanFace } from 'lucide-react';
declare module "react" {
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": any;
      }
    }
  }
export default function UrwisAR() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Sprawdzamy czy urządzenie to smartfon/tablet (AR działa tylko na urządzeniach mobilnych)
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  if (!isMobile) return null; // Ukrywamy przycisk na komputerach stacjonarnych

  const triggerAR = () => {
    // Programowe wywołanie kliknięcia w ukryty natywny przycisk AR wewnątrz model-viewer
    const btn = document.getElementById('ar-trigger-btn');
    if (btn) btn.click();
  };

  return (
    <>
      {/* Dynamiczne ładowanie silnika Google Model Viewer */}
      <Script 
        type="module" 
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" 
      />
      
      {/* Niewidoczny kontener dla modelu 3D (wymagany przez silnik AR) */}
      <div className="fixed opacity-0 pointer-events-none w-px h-px overflow-hidden">
        <model-viewer 
          id="urwis-ar-viewer"
          src="/urwis.glb" 
          ar 
          ar-modes="webxr scene-viewer quick-look" 
          camera-controls 
          alt="Urwisek 3D w AR"
        >
          <button slot="ar-button" id="ar-trigger-btn"></button>
        </model-viewer>
      </div>

      {/* Przycisk wyzwalający tryb Rozszerzonej Rzeczywistości */}
      <button 
        onClick={triggerAR}
        className="fixed top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-3 md:p-4 rounded-full shadow-[0_10px_25px_-5px_rgba(0,85,255,0.4)] border-2 border-white dark:border-zinc-800 z-50 text-urwis-blue hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
      >
        <ScanFace size={22} className="animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:group-hover:block transition-all pr-2">
          Zobacz w pokoju
        </span>
      </button>
    </>
  );
}