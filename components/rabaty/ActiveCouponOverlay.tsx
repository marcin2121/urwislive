import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X } from 'lucide-react';

interface ActiveCouponOverlayProps {
  activeCoupon: { id: string; expiresAt: number };
  currentActiveData: any;
  showActiveOverlay: boolean;
  setShowActiveOverlay: (val: boolean) => void;
  onExpire: (id: string, timestamp: number) => void;
}

export default function ActiveCouponOverlay({
  activeCoupon,
  currentActiveData,
  showActiveOverlay,
  setShowActiveOverlay,
  onExpire,
}: ActiveCouponOverlayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    Math.max(0, Math.floor((activeCoupon.expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((activeCoupon.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpire(activeCoupon.id, activeCoupon.expiresAt);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCoupon, onExpire]);

  if (!currentActiveData) return null;

  return (
    <>
      {/* PEŁNOEKRANOWY TIMER KUPONU */}
      <AnimatePresence>
        {showActiveOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-white text-zinc-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* PŁYWAJĄCY GÓRNY PASEK OMIJAJĄCY NAVBAR */}
            <div
              className={`absolute top-12 md:top-8 left-4 right-4 h-14 rounded-2xl flex items-center justify-between px-4 text-white shadow-xl ${
                timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-[#0055ff]'
              }`}
            >
              <span className="text-sm md:text-xl font-black uppercase tracking-widest flex-1 text-left sm:text-center ml-2">
                Pokaż ten ekran kasjerce
              </span>
              <button
                onClick={() => setShowActiveOverlay(false)}
                className="ml-2 shrink-0 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2 text-white text-xs font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer outline-none"
                aria-label="Minimalizuj widok kuponu"
              >
                <X size={14} /> <span className="hidden sm:inline">Minimalizuj</span>
              </button>
            </div>

            <motion.div
              animate={{ scale: timeLeft < 60 ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: timeLeft < 60 ? Infinity : 0, duration: 1 }}
              className="mt-8 mb-8"
            >
              <Timer size={80} className={`mx-auto mb-4 ${timeLeft < 60 ? 'text-red-500' : 'text-[#0055ff]'}`} />
              <div
                className={`text-[6rem] sm:text-8xl md:text-[10rem] font-black font-mono tracking-tighter leading-none ${
                  timeLeft < 60 ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'text-zinc-900'
                }`}
              >
                {`${Math.floor(timeLeft / 60)
                  .toString()
                  .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
              </div>
              <p className="text-xl md:text-2xl font-black text-zinc-400 uppercase mt-4">Czas do wygaśnięcia</p>
            </motion.div>

            {/* 🔥 NOWY DESIGN BOXA KUPONU 🔥 */}
            <div
              className={`w-full max-w-2xl bg-gradient-to-br ${currentActiveData.gradient || 'from-[#0055ff] to-blue-600'} p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center min-h-[220px] md:min-h-[280px] w-[calc(100%-2rem)] mx-auto overflow-hidden`}
            >
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-black italic uppercase mb-6 sm:mb-8 leading-tight tracking-tight px-2 break-words w-full">
                {currentActiveData.title}
              </h3>
              <div className="bg-white/10 backdrop-blur-md border border-white/30 text-white py-4 sm:py-6 px-6 sm:px-10 rounded-[1.5rem] sm:rounded-3xl flex flex-col items-center shadow-inner w-full max-w-full overflow-hidden shrink-0">
                <span className="block text-xs sm:text-sm uppercase font-black text-white/70 mb-1 sm:mb-2 tracking-widest text-center">
                  Twój Kod Rabatu:
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest drop-shadow-md break-all">
                  {currentActiveData.code}
                </span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMALIZOWANA PIGUŁKA KUPONU */}
      <AnimatePresence>
        {!showActiveOverlay && (
          <motion.button
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            onClick={() => setShowActiveOverlay(true)}
            className={`fixed top-20 md:top-24 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-[99999] rounded-2xl flex items-center justify-center gap-3 py-4 px-6 text-white font-black text-sm uppercase tracking-widest cursor-pointer shadow-2xl outline-none ${
              timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-[#0055ff]'
            }`}
          >
            <Timer size={20} />
            <span className="hidden sm:inline">Aktywny kupon:</span>
            <span className="truncate max-w-[120px] sm:max-w-none">{currentActiveData.title}</span>
            <span className="font-mono bg-black/20 px-2 py-1 rounded-lg shrink-0">
              {`${Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
