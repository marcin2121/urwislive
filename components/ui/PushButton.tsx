'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';

export default function PushButton() {
  
  const handleSubscribe = () => {
    // TUTAJ WKLEJ SWOJĄ LOGIKĘ DO POWIADOMIEŃ PUSH (np. OneSignal.showSlidedown())
    console.log("Kliknięto włączanie powiadomień!");
  };

  return (
    <motion.button
      onClick={handleSubscribe}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center justify-center p-2.5 rounded-full bg-zinc-100/60 hover:bg-zinc-200/80 text-zinc-600 transition-colors border border-white/50 shadow-sm"
      aria-label="Włącz powiadomienia push"
    >
      {/* Elegancka ikonka dzwonka */}
      <BellRing className="w-[18px] h-[18px] md:w-5 md:h-5" strokeWidth={2} />
      
      {/* Mała, pulsująca kropka powiadomienia (Sygnalizuje akcję do wykonania) */}
      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF2024] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BF2024] border border-white"></span>
      </span>
    </motion.button>
  );
}