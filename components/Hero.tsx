'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  MapPin, ShoppingBag, Sparkles, 
  Store, Gift, ArrowRight, X 
} from 'lucide-react';

export default function HeroSection() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, duration: "8s", delay: "0s" },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, duration: "7s", delay: "-2s" },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, duration: "9s", delay: "-4s" },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, duration: "10s", delay: "-1s" },
  ];

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-transparent pt-32 pb-20">
      
      {/* 🟢 TŁO: Radial gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[radial-gradient(circle,rgba(0,85,255,0.08)_0%,transparent_70%)] rounded-full" />
      </div>

      {/* 🟢 PŁYWAJĄCE IKONY: Teraz w czystym CSS dla 0% obciążenia JS */}
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
          {/* 🚀 OPTYMALIZACJA LCP: Brak opacity: 0. Startujemy od razu widocznym tekstem. */}
          <motion.h1 
            initial={{ y: 15 }}
            animate={{ y: 0 }}
            className="text-5xl md:text-7xl lg:text-[6.5vw] font-black tracking-tighter leading-[0.9] flex items-center justify-center flex-wrap md:flex-nowrap"
          >
            <span className="text-zinc-900">SKLEP</span>
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff] ml-4 md:ml-8 pr-[0.05em]">
              URWIS
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl lg:text-4xl font-medium text-zinc-500 mt-6 tracking-tight italic"
          >
            Nie tylko dla grzecznych dzieci
          </motion.p>
        </div>

        {/* 🚀 KLUCZOWA ZMIANA SEO: Dodano LEGO i wyprawkę szkolną */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-2xl text-zinc-600 max-w-4xl mx-auto mb-16 font-bold leading-relaxed balance"
        >
          Największy w regionie wybór klocków <span className="text-[#BF2024]">LEGO</span>, zabawek 
          i pełnej <span className="text-[#0055ff]">wyprawki szkolnej</span> przy ul. Reymonta 38A.  
          Prawdziwy sklep stacjonarny, w którym rządzisz Ty i Twoja wyobraźnia!
        </motion.p>

        <div className="flex justify-center items-center mt-4">
          <Link 
            href="/rabaty" 
            className="group relative w-full sm:w-auto px-12 py-6 md:px-16 md:py-8 bg-gradient-to-r from-[#BF2024] to-[#0055ff] text-white rounded-full font-black text-2xl md:text-3xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-[0_0_40px_rgba(0,85,255,0.4)]"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-4 italic tracking-tight uppercase">
              Odbierz rabat! <ArrowRight size={28} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* Indykator scrolla (CSS Only) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-pulse hidden md:flex">
        <div className="w-[2px] h-10 bg-gradient-to-b from-zinc-900 to-transparent rounded-full" />
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
                  onClick={() => {
                    setIsMapOpen(false);
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-all"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              
              <div className="aspect-square md:aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-zinc-100 bg-zinc-50 relative">
                {/* 🚀 Zaktualizowany i przekonwertowany Iframe z Google Maps */}
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