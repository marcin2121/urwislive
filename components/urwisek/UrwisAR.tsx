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
  const [isMobile, setIsMobile] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  // Ładuj skrypt dopiero gdy sekcja wejdzie do viewportu
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Sprawdź czy skrypt już wstrzyknięty
          if (document.querySelector('script[data-model-viewer]')) {
            setScriptLoaded(true);
            observer.disconnect();
            return;
          }

          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
          script.setAttribute('data-model-viewer', 'true');
          script.onload = () => setScriptLoaded(true);
          document.head.appendChild(script);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  if (!isMobile) return null;

  const triggerAR = () => {
    const btn = document.getElementById('ar-trigger-btn');
    if (btn) btn.click();
  };

  return (
    <section
      ref={containerRef}
      className="py-12 px-6 relative z-20"
      style={{ minHeight: '280px' }} // fix CLS — zapobiega skakaniu layoutu
    >
      {/* Niewidoczny silnik AR — renderuj dopiero po załadowaniu skryptu */}
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

      {/* 🌈 BANER AR */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          onClick={triggerAR}
          className="relative group cursor-pointer overflow-hidden rounded-4xl bg-white/40 backdrop-blur-2xl p-8 md:p-12 border-2 border-white shadow-xl"
        >
          {/* Stylizowane tło */}
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
                {scriptLoaded ? 'Uruchom AR' : 'Ładowanie…'}
              </motion.div>

              {/* Dekoracyjna ikonka */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-zinc-900 p-2 rounded-xl rotate-12 shadow-lg group-hover:rotate-0 transition-transform">
                <Box size={20} strokeWidth={3} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
