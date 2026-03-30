'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, ShoppingBag, Timer } from "lucide-react";
import Link from 'next/link';

// --- DANE PROMOCJI ---
const promoHighlights = [
  {
    id: 1,
    title: "LEGO Technic Monster Jam",
    oldPrice: "89.99",
    newPrice: "64.99",
    badge: "-25% OKAZJA",
    color: "#BF2024",
    endsIn: "2 dni",
    isHot: true
  },
  {
    id: 2,
    title: "Plecak CoolPack Gradient",
    oldPrice: "219.00",
    newPrice: "169.00",
    badge: "HIT CENOWY",
    color: "#0055ff",
    endsIn: "Do wyczerpania",
    isHot: false
  },
  {
    id: 3,
    title: "Gra Planszowa Wsiąść do Pociągu",
    oldPrice: "159.99",
    newPrice: "129.99",
    badge: "OSTATNIE SZTUKI",
    color: "#22c55e",
    endsIn: "Ostatnie sztuki",
    isHot: false
  }
];

// --- DANE DO PASKA ---
const storeFeatures = [
  { icon: "🎈", text: "Pompujemy balony helem" },
  { icon: "🎨", text: "Artykuły plastyczne i biurowe" },
  { icon: "🎂", text: "Akcesoria imprezowe" },
  { icon: "🧩", text: "Klocki LEGO i zabawki" },
  { icon: "✨", text: "Upominki na każdą okazję" },
];

export default function PromoSection() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="relative py-16 lg:py-24 bg-transparent overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">


        
        {/* --- NAGŁÓWEK --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 relative z-20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-100/80 backdrop-blur-sm text-[#BF2024] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-pulse border border-red-200/50">
                <Flame size={14} fill="currentColor" /> Gorące strzały
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight leading-none">
              OKAZJE <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff] drop-shadow-sm">
                TYGODNIA
              </span>
            </h2>
          </div>
          
          <Link 
            href="/oferta/promocje"
            className="group relative z-30 flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-md border border-white/50 rounded-full text-sm font-black uppercase tracking-widest text-gray-600 hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-xl"
          >
            Zobacz wszystkie <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- GRID KAFELKÓW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promoHighlights.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`group relative bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-4 border-2 transition-all duration-300 cursor-pointer
                ${item.isHot 
                  ? 'border-[#BF2024]/40 shadow-[0_20px_50px_rgba(191,32,36,0.15)]' 
                  : 'border-white/50 hover:border-[#BF2024]/30 shadow-sm hover:shadow-xl'
                }
              `}
            >
              <div 
                className={`absolute top-6 left-6 z-20 px-4 py-1.5 rounded-xl text-xs font-black text-white shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform
                  ${item.isHot ? 'animate-bounce' : ''}
                `}
                style={{ backgroundColor: item.color }}
              >
                {item.badge}
              </div>

              <div className="relative aspect-4/3 bg-white/50 rounded-4xl overflow-hidden mb-4 border border-gray-100/50">
                <div className="absolute inset-0 flex items-center justify-center text-gray-200 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag size={64} />
                </div>
              </div>

              <div className="px-2 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  <Timer size={14} className="text-[#0055ff]" /> {item.endsIn}
                </div>
                <h3 className="text-lg font-black text-gray-900 leading-tight mb-3 font-heading group-hover:text-[#BF2024] transition-colors line-clamp-2 min-h-12">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-white/50 group-hover:bg-white transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 line-through font-bold">{item.oldPrice} zł</span>
                    <span className="text-xl font-black text-gray-900">{item.newPrice} zł</span>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transform group-hover:rotate-90 transition-transform duration-300"
                    style={{ backgroundColor: item.color }}
                  >
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- DYNAMICZNY INFINITE MARQUEE (FIXED) --- */}
        <div className="mt-12 overflow-hidden relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="bg-zinc-900/95 backdrop-blur-md rounded-2xl py-6 border border-white/10 shadow-2xl cursor-help"
          >
            {/* KLUCZOWA ZMIANA: Używamy klasy CSS marquee-container zamiast Framer Motion dla x */}
            <div className={`marquee-container ${isPaused ? 'marquee-paused' : ''}`}>
              <div className="flex gap-12 items-center px-6">
                {/* Łączymy tablicę dwukrotnie, aby uzyskać płynność */}
                {[...storeFeatures, ...storeFeatures, ...storeFeatures].map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-sm">{feature.icon}</span>
                    <p className="text-sm md:text-base font-black tracking-wider uppercase font-heading text-white">
                      {feature.text}
                    </p>
                    <div className="ml-12 w-2 h-2 rounded-full bg-linear-to-r from-[#BF2024] to-[#0055ff] shadow-[0_0_10px_rgba(0,85,255,0.5)]" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <p className="text-center text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-widest opacity-40">
            {isPaused ? "Zatrzymano • Przesuń myszkę, aby wznowić" : "Najedź, aby zatrzymać"}
          </p>
        </div>

      </div>
    </section>
  );
}