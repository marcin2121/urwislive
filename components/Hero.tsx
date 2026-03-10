'use client';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import Link from 'next/link';
import { 
  ShoppingBag, Sparkles, Store, Gift, ArrowRight, X, MapPin 
} from 'lucide-react';

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

const PARTICLES = Array.from({length: 40}).map((_, i) => ({
  id: i,
  x: (i * 13) % 100,
  y: (i * 19) % 100,
  size: 10 + (i % 12),
  type: ['star', 'circle', 'cross'][i % 3],
  color: ['#BF2024', '#0055ff', '#fbbf24'][i % 3],
  duration: 20 + (i % 15),
  delay: -(i % 30),
  xOffset: (i % 10) - 5
}));

// Przelatujący biały błysk na tekście (wykorzystujący gradient background) - Brak cięć krawędzi
const ShineTextEffect = () => (
  <h1 className="text-[10.5vw] sm:text-7xl md:text-8xl lg:text-[8vw] font-black tracking-tighter leading-[0.9] drop-shadow-sm relative pb-4">
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff] inline-block pr-2 sm:pr-4 pb-2">
      URWIS
    </span>
    {/* Kopia tekstu z nałożonym animowanym gradientem */}
    <span 
      aria-hidden="true"
      className="absolute top-0 left-0 text-transparent bg-clip-text animate-shine-text pointer-events-none inline-block pr-4 pb-2"
      style={{
        backgroundImage: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.4) 55%, transparent 80%)',
        backgroundSize: '200% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      URWIS
    </span>
  </h1>
);

const StarDustParticlesPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-transparent">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute opacity-40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.color,
          }}
          animate={{
            y: ["0vh", "-100vh"],
            x: ["0vw", `${p.xOffset}vw`],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
            x: { duration: p.duration * 0.8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: p.delay },
            rotate: { duration: p.duration * 0.6, repeat: Infinity, ease: "linear" }
          }}
        >
          {p.type === 'star' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          )}
          {p.type === 'circle' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
          {p.type === 'cross' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11H13V5C13 4.45 12.55 4 12 4C11.45 4 11 4.45 11 5V11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13H11V19C11 19.55 11.45 20 12 20C12.55 20 13 19.55 13 19V13H19C19.55 13 20 12.55 20 12C20 11.45 19.55 11 19 11Z" />
            </svg>
          )}
        </motion.div>
      ))}

      {/* Delikatne maski zanikające przy krawędziach lekko wspierające czytelność, nie blokujące Ribbons */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  )
}

export default function HeroSection() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, duration: "8s", delay: "0s" },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, duration: "7s", delay: "-2s" },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, duration: "9s", delay: "-4s" },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, duration: "10s", delay: "-1s" },
  ];

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-[85dvh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-transparent text-zinc-900 pt-24 md:pt-[10vh] pb-16 md:pb-20"
    >
      
      {/* 🧩 URWIS STARDUST (OPCJA A) */}
      <StarDustParticlesPattern />

      {/* 🟢 PŁYWAJĄCE IKONY: CSS Float */}
      {floatingElements.map((item, i) => (
        <div
          key={i}
          className="absolute hidden lg:block pointer-events-none opacity-20 animate-float"
          style={{ 
            top: item.y, 
            left: item.x, 
            color: item.color,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        >
          <item.Icon size={item.size} strokeWidth={1.2} />
        </div>
      ))}

      {/* GŁÓWNA TREŚĆ */}
      <div className="relative z-10 container mx-auto px-6 text-center -mt-8 md:-mt-0">
        
        <div className="mb-6 md:mb-8">
            <motion.div 
            initial={{ y: 20, rotateX: -10, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="flex items-baseline justify-center flex-nowrap gap-x-3 sm:gap-x-4 md:gap-x-8"
            style={{ perspective: 1000 }}
          >
            <motion.h1 
              initial={{ y: 0 }}
              className="text-[11vw] sm:text-7xl md:text-8xl lg:text-[8vw] font-black tracking-tighter leading-[0.9] text-zinc-900 drop-shadow-sm flex pb-4 pr-1 sm:pr-4"
            >
              {Array.from("SKLEP").map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </motion.h1>
            
            {/* URWIS - Płynny Gradient + Błysk */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              <ShineTextEffect />
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-500 mt-2 md:mt-6 tracking-tight italic"
          >
            Nie tylko dla grzecznych dzieci
          </motion.p>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-base sm:text-lg md:text-xl font-medium text-zinc-600 max-w-3xl mx-auto balance leading-snug md:leading-relaxed mb-6 md:mb-10 px-1"
        >
          Największy w regionie wybór klocków <span className="font-black text-[#BF2024]">LEGO</span>, zabawek 
          i pełnej <span className="font-black text-[#0055ff]">wyprawki szkolnej</span> przy ul. Reymonta 38A.  
          Prawdziwy sklep stacjonarny, w którym rządzisz Ty i Twoja wyobraźnia!
        </motion.p>

        {/* 3 CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          {/* CTA 1: Rabaty */}
          <Link href="/rabaty" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#BF2024] to-[#0055ff] text-white font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-3">
              <Gift size={22} className="opacity-90" />
              <span>Odbierz Rabaty</span>
            </button>
          </Link>

          {/* CTA 2: Strefa Zabawy */}
          <Link href="/strefa-zabawy" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-100 font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group">
              <Sparkles size={22} className="text-[#0055ff] group-hover:scale-110 transition-transform" />
              <span>Strefa Zabawy</span>
            </button>
          </Link>

          {/* CTA 3: Jak dojechać */}
          <button 
            onClick={() => setIsMapOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-100 font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group"
          >
            <MapPin size={22} className="text-[#BF2024] group-hover:scale-110 transition-transform" />
            <span>Gdzie jesteśmy?</span>
          </button>
        </motion.div>
      </div>

      {/* Indykator scrolla */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 hidden md:flex animate-bounce">
        <div className="w-[3px] h-12 bg-gradient-to-b from-zinc-400 to-transparent rounded-full" />
      </div>

      {/* MODAL MAPY */}
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl border border-white/50 z-10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#BF2024] uppercase tracking-widest">Zapraszamy stacjonarnie</span>
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase italic">Białobrzegi, Reymonta 38A</h2>
                </div>
                <button 
                  onClick={() => setIsMapOpen(false)}
                  className="w-12 h-12 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-all"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              
              <div className="aspect-square md:aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-zinc-100 bg-zinc-50 relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2475.7798969279215!2d20.950946668338!3d51.645555856910185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4718fdfaefa939bb%3A0x70c667b47a29301c!2sUrwis%20-%20Zabawki%20-%20Art.%20Szkolne%20i%20Biurowe!5e0!3m2!1spl!2spl!4v1771662047423!5m2!1spl!2spl" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, position: "absolute", top: 0, left: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* ✨ Floating elements geometry */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float linear infinite;
          will-change: transform;
        }

        /* ✨ Błysk przechodzący przez tekst poprzez mapowanie tła */
        @keyframes textShineBg {
          0% { background-position: 250% center; }
          20% { background-position: -100% center; }
          100% { background-position: -100% center; }
        }
        .animate-shine-text {
          animation: textShineBg 4s ease-in-out infinite;
        }
        
        .balance {
          text-wrap: balance;
        }
      `}</style>
    </section>
  );
}