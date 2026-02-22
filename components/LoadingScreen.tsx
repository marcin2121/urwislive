'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // 🚀 IMPORT DLA OPTYMALIZACJI
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const increment = duration / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, increment);

    return () => clearInterval(timer);
  }, [onComplete]);

  const messages = [
    "Budzimy Urwisa...",
    "Rozkładamy klocki LEGO...",
    "Pompujemy basen z kulkami...",
    "Prawie gotowe! 🚀",
  ];

  const messageIndex = Math.min(Math.floor(progress / 25), messages.length - 1);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 bg-zinc-50 z-[9999] flex items-center justify-center overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Ekran ładowania Sklepu Urwis"
        >
          {/* TŁO DEKORACYJNE */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BF2024]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0055ff]/5 rounded-full blur-[80px] pointer-events-none translate-x-20 -translate-y-20" />

          <div className="text-center space-y-10 max-w-md mx-auto px-6 relative z-10 w-full">

            {/* LOGO URWISA - ZOPTYMALIZOWANE */}
            <div className="relative w-48 h-48 mx-auto">
              <motion.div
                className="absolute inset-0 bg-[#0055ff]/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 bg-[#BF2024]/20 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-2xl"
              >
                {/* 🚀 ZOPTYMALIZOWANE LOGO */}
                <Image 
                  src="/logo.png" 
                  alt="Logo Sklepu Urwis" 
                  width={160} 
                  height={160} 
                  priority // Wysoki priorytet ładowania
                  className="object-contain drop-shadow-lg" 
                />
              </motion.div>
            </div>

            {/* TYPOGRAFIA */}
            <div className="space-y-3">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
                Wczytuję <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">Urwisa</span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>...</motion.span>
              </h2>

              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-2"
                >
                  {messages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* PASEK POSTĘPU - DOSTĘPNY (Accessibility) */}
            <div className="space-y-3 pt-4">
              <div 
                className="relative w-full h-3 bg-zinc-200 rounded-full overflow-hidden shadow-inner"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {/* Pasek właściwy */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-[#0055ff] to-[#BF2024] rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />

                {/* Efekt błysku */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ width: '50%' }}
                />
              </div>

              {/* Procenty */}
              <div className="text-right">
                <motion.span
                  className="text-2xl font-black text-[#BF2024] italic tracking-tighter"
                  animate={progress === 100 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {progress}%
                </motion.span>
              </div>
            </div>

            {/* IKONKI ZABAWEK */}
            <div className="flex justify-center gap-6 pt-4 text-3xl opacity-80" aria-hidden="true">
              {['🧩', '🎈', '🎨', '🎮'].map((icon, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="drop-shadow-md"
                >
                  {icon}
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}