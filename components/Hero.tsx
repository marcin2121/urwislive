'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ShoppingBag, Sparkles, Store, Gift, ArrowRight, X 
} from 'lucide-react';

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { SparklesText } from "@/components/ui/sparkles-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, duration: "8s", delay: "0s" },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, duration: "7s", delay: "-2s" },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, duration: "9s", delay: "-4s" },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, duration: "10s", delay: "-1s" },
  ];

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-white text-zinc-900 pt-32 pb-20">
      
      {/* 🔮 NOWE TŁO - MAGIC UI ANIMATED GRID PATTERN */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
          "inset-0 h-full w-full skew-y-12"
        )}
      />

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
      <div className="relative z-10 container mx-auto px-6 text-center">
        
        <div className="mb-8">
          <motion.div 
            initial={{ y: 20, rotateX: -10, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="flex items-center justify-center flex-wrap md:flex-nowrap"
            style={{ perspective: 1000 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[7vw] font-black tracking-tighter leading-[0.9] text-zinc-900 drop-shadow-sm">
              SKLEP
            </h1>
            
            {/* 🔮 MAGIC UI SPARKLES TEXT */}
            <div className="ml-4 md:ml-8 -mt-2">
              <SparklesText 
                colors={{ first: '#BF2024', second: '#0055ff' }}
                className="text-5xl md:text-7xl lg:text-[7vw] font-black tracking-tighter leading-[0.9] text-zinc-900" 
                sparklesCount={8}
              >
                URWIS
              </SparklesText>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="text-xl md:text-3xl lg:text-4xl font-medium text-zinc-500 mt-6 md:mt-8 tracking-tight italic"
          >
            Nie tylko dla grzecznych dzieci
          </motion.p>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-2xl text-zinc-600 max-w-4xl mx-auto mb-16 font-medium leading-relaxed balance"
        >
          Największy w regionie wybór klocków <span className="font-black text-[#BF2024]">LEGO</span>, zabawek 
          i pełnej <span className="font-black text-[#0055ff]">wyprawki szkolnej</span> przy ul. Reymonta 38A.  
          Prawdziwy sklep stacjonarny, w którym rządzisz Ty i Twoja wyobraźnia!
        </motion.p>

        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.8, duration: 0.5, type: 'spring', stiffness: 100 }}
           className="flex justify-center items-center mt-4 w-full sm:w-auto"
        >
          {/* 🚀 MAGIC UI SHIMMER BUTTON */}
          <Link href="/rabaty" className="inline-block">
            <ShimmerButton className="shadow-2xl hover:scale-105 active:scale-95 transition-transform" background="#18181b">
              <span className="whitespace-pre-wrap text-center text-xl md:text-2xl font-black italic tracking-tight uppercase leading-none text-white flex items-center gap-3">
                Odbierz rabat! <ArrowRight size={24} strokeWidth={3} className="text-white drop-shadow-sm" />
              </span>
            </ShimmerButton>
          </Link>
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
        
        .balance {
          text-wrap: balance;
        }
      `}</style>
    </section>
  );
}