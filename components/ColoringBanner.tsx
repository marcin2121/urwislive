'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Palette, Paintbrush, Sparkles, ArrowRight, MousePointerClick } from 'lucide-react';

export default function ColoringBanner() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 my-16 font-sans">
      <Link href="/kolorowanki" className="block group">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-[3rem] bg-zinc-900 shadow-2xl flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-16 border border-zinc-800 transition-all duration-500 hover:shadow-blue-900/20"
        >
          
          {/* PŁYWAJĄCE TŁO (KOLORY) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                x: [0, 50, 0], 
                y: [0, 30, 0], 
                scale: [1, 1.2, 1] 
              }} 
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[#BF2024]/30 rounded-full blur-[80px]"
            />
            <motion.div 
              animate={{ 
                x: [0, -50, 0], 
                y: [0, -30, 0], 
                scale: [1, 1.3, 1] 
              }} 
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
              className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#0055ff]/30 rounded-full blur-[80px]"
            />
          </div>

          {/* LEWA STRONA - TEKST */}
          <div className="relative z-10 text-center md:text-left mb-12 md:mb-0 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-lg">
              <MousePointerClick size={14} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Darmowa Zabawa Online</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.85] mb-6 drop-shadow-xl">
              Interaktywna <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500">Kolorowanka</span>
            </h2>
            
            <p className="text-sm md:text-base font-bold text-zinc-300 uppercase tracking-wide leading-relaxed drop-shadow-md">
              Chwyć za wirtualny pędzel, wybierz obrazek i stwórz własne dzieło sztuki bezpośrednio na ekranie. Gotowy rysunek pobierzesz na pamiątkę!
            </p>
          </div>

          {/* PRAWA STRONA - PRZYCISK I DEKORACJE */}
          <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-center md:justify-end mt-4 md:mt-0">
            <div className="relative">
              
              {/* Animowana Paleta */}
              <motion.div 
                animate={{ rotate: [-10, 10, -10], y: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-12 -left-8 md:-top-16 md:-left-16 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 text-yellow-400 shadow-xl hidden sm:flex"
              >
                <Palette size={32} />
              </motion.div>
              
              {/* Animowany Pędzel */}
              <motion.div 
                animate={{ rotate: [10, -10, 10], y: [5, -5, 5] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-4 md:-bottom-12 md:-right-10 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 text-blue-400 shadow-xl hidden sm:flex"
              >
                <Paintbrush size={32} />
              </motion.div>

              <button className="w-full md:w-auto px-8 py-5 md:py-6 bg-white text-zinc-900 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-4 group-hover:bg-[#0055ff] group-hover:text-white transition-colors duration-300 shadow-2xl relative overflow-hidden">
                <span className="relative z-10">Zacznij Malować</span>
                <div className="relative z-10 w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

        </motion.div>
      </Link>
    </section>
  );
}