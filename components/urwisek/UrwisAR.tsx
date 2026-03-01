'use client'

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, Sparkles, Box } from 'lucide-react';

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

export default function UrwisAR() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // ← null = jeszcze nie sprawdzono
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadingTriggered, setLoadingTriggered] = useState(false);

  useEffect(() => {
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  const loadScriptAndTriggerAR = () => {
    if (!isMobile) return;

    if (scriptLoaded) {
      document.getElementById('ar-trigger-btn')?.click();
      return;
    }

    setLoadingTriggered(true);

    if (document.querySelector('script[data-model-viewer]')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
    script.setAttribute('data-model-viewer', 'true');
    script.onload = () => {
      setScriptLoaded(true);
      setTimeout(() => {
        document.getElementById('ar-trigger-btn')?.click();
      }, 300);
    };
    document.head.appendChild(script);
  };

  // ✅ Zamiast return null — zawsze renderuj sekcję z min-h
  // Na desktop: sekcja jest niewidoczna ale ZAJMUJE MIEJSCE (brak CLS)
  // Na mobile: sekcja jest widoczna normalnie
  // null oznacza "jeszcze nie wiem" — też rezerwuj miejsce
  return (
    <section
      className="py-12 px-6 relative z-20"
      style={{ minHeight: '280px' }}
      // ✅ Na desktop chowamy zawartość ale sekcja zajmuje miejsce w layoutcie
      aria-hidden={isMobile === false ? 'true' : undefined}
    >
      {/* Niewidoczny silnik AR */}
      {scriptLoaded && (
        <div className="fixed opacity-0 pointer-events-none w-px h-px overflow-hidden">
          <model-viewer
            id="urwis-ar-viewer"
            src="/urwis.glb"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            alt="Urwisek 3D"
          >
            <button slot="ar-button" id="ar-trigger-btn"></button>
          </model-viewer>
        </div>
      )}

      {/* ✅ Baner AR — widoczny tylko gdy isMobile === true */}
      {isMobile === true && (
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            onClick={loadScriptAndTriggerAR}
            className="relative group cursor-pointer overflow-hidden rounded-4xl bg-white/40 backdrop-blur-2xl p-8 md:p-12 border-2 border-white shadow-xl"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-urwis-blue/10 rounded-full blur-3xl group-hover:bg-urwis-blue/20 transition-colors" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-urwis-blue/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
                  <Sparkles size={14} className="text-urwis-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-urwis-blue">
                    Technologia AR
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-zinc-900">
                  Zobacz Urwiska <br />
                  <span className="text-urwis-blue">w swoim pokoju!</span>
                </h2>

                <p className="text-lg text-zinc-600 font-bold max-w-md mx-auto md:mx-0 leading-tight uppercase italic">
                  Użyj aparatu i przenieś naszą maskotkę do rzeczywistości.{' '}
                  <span className="text-zinc-900">Magia 3D</span> w Twoim telefonie!
                </p>
              </div>

              <div className="relative shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-zinc-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest flex items-center gap-3 shadow-xl group-hover:bg-urwis-blue transition-all"
                >
                  <ScanFace size={24} />
                  {!loadingTriggered ? 'Uruchom AR' : !scriptLoaded ? 'Ładowanie…' : 'Otwieranie…'}
                </motion.div>

                <div className="absolute -top-4 -right-4 bg-amber-400 text-zinc-900 p-2 rounded-xl rotate-12 shadow-lg group-hover:rotate-0 transition-transform">
                  <Box size={20} strokeWidth={3} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ Na desktop — sekcja z jasnym wytłumaczeniem dlaczego nie ma skanera */}
      {isMobile === false && (
        <div className="max-w-3xl mx-auto text-center py-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-zinc-100 rounded-full mb-6 text-zinc-400">
            <ScanFace size={48} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-zinc-900 mb-4">Urwis AR jest na telefony!</h2>
          <p className="text-zinc-500 font-bold uppercase text-sm tracking-widest max-w-lg mx-auto leading-relaxed">Rozszerzoną Rzeczywistość obsługujemy tylko poprzez kamerę w urządzeniach mobilnych. Wejdź na tę stronę ze swojego smartfona, aby zobaczyć magię!</p>
        </div>
      )}
    </section>
  );
}
