import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, Sparkles, Store, Gift, MapPin, X 
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const ShineTextEffect = () => (
  <h1 className="text-[8.5vw] sm:text-5xl md:text-6xl lg:text-[5.8vw] xl:text-[7.5rem] font-black leading-[0.9] drop-shadow-sm relative pb-4">
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff] inline-block pr-2 sm:pr-4 pb-2">
      URWIS
    </span>
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

export default function HeroContent() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const floatingElements = [
    { Icon: ShoppingBag, x: "12%", y: "20%", color: "#BF2024", size: 60, duration: "8s", delay: "0s" },
    { Icon: Gift, x: "85%", y: "15%", color: "#0055ff", size: 50, duration: "7s", delay: "-2s" },
    { Icon: Sparkles, x: "10%", y: "75%", color: "#fbbf24", size: 40, duration: "9s", delay: "-4s" },
    { Icon: Store, x: "88%", y: "70%", color: "#0055ff", size: 55, duration: "10s", delay: "-1s" },
  ];

  return (
    <>
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

      <div className="relative z-10 container mx-auto px-6 text-center -mt-8 md:-mt-0">
        
        <div className="mb-6 md:mb-8">
          <div className="flex items-baseline justify-center flex-nowrap gap-x-20 sm:gap-x-40 md:gap-x-[15vw] xl:gap-x-64 relative">
            {/* 🎨 TŁO: Urwis-Hero */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[53%] -translate-y-[67%] md:-translate-y-[63%] -z-10 w-[70%] md:w-[32vw] max-w-[530px] aspect-square flex items-center justify-center pointer-events-none">
              <Image 
                src="/Urwis-Hero.webp" 
                alt="Tło Urwis" 
                fill
                sizes="(max-width: 768px) 70vw, 600px"
                priority
                fetchPriority="high"
                className="object-contain opacity-100 select-none" 
              />
            </div>
            
            <h1 className="text-[8.5vw] sm:text-5xl md:text-6xl lg:text-[5.8vw] xl:text-[7.5rem] font-black leading-[0.9] text-zinc-800 drop-shadow-sm pb-4 pr-1 sm:pr-4">
              SKLEP
            </h1>
            
            <ShineTextEffect />
          </div>
          
          {/* USUNIĘTO animację - ten tekst jest widoczny natychmiast */}
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-[2.2vw] xl:text-4xl font-bold text-zinc-600 mt-12 md:mt-[10vw] xl:mt-32 tracking-tight">
            Nie tylko dla grzecznych dzieci
          </p>
        </div>

        {/* USUNIĘTO animację - to nasz nowy główny element LCP na mobile */}
        <p className="text-base sm:text-lg md:text-xl font-medium text-zinc-600 max-w-3xl mx-auto balance leading-snug md:leading-relaxed mb-6 md:mb-10 px-1">
          Największy w regionie wybór klocków <span className="font-black text-[#BF2024]">LEGO</span>, zabawek 
          i pełnej <span className="font-black text-[#0055ff]">wyprawki szkolnej</span> przy ul. Reymonta 38A.  
          Prawdziwy sklep stacjonarny, w którym rządzisz Ty i Twoja wyobraźnia!
        </p>

        {/* Przyciski zachowują animację dla fajnego efektu (z mniejszym opóźnieniem) */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-hero-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          <Link href="/rabaty" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#BF2024] to-[#0055ff] text-white font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-3">
              <Gift size={22} className="opacity-90" />
              <span>Odbierz Rabaty</span>
            </button>
          </Link>

          <Link href="/strefa-zabawy" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-100 font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group">
              <Sparkles size={22} className="text-[#0055ff] group-hover:scale-110 transition-transform" />
              <span>Strefa Zabawy</span>
            </button>
          </Link>

          <button 
            onClick={() => setIsMapOpen(true)} 
            className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-100 font-bold rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 group"
          >
            <MapPin size={22} className="text-[#BF2024] group-hover:scale-110 transition-transform" />
            <span>Gdzie jesteśmy?</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1001] p-4" onClick={() => setIsMapOpen(false)}>
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
    </>
  );
}