"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Smile, Sparkles, Paintbrush, Target } from 'lucide-react';

export default function PlayZoneBanner() {
  return (
    <div className="group relative bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-16 border-2 border-white shadow-xl overflow-hidden h-full flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-32 bg-[#0055ff]/10 blur-[150px] rounded-full pointer-events-none group-hover:bg-[#0055ff]/20 transition-colors"></div>
          <div className="absolute bottom-0 left-0 p-32 bg-[#BF2024]/10 blur-[150px] rounded-full pointer-events-none group-hover:bg-[#BF2024]/20 transition-colors"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-white text-zinc-900 font-black uppercase text-xs tracking-widest mb-6 shadow-sm">
                <Sparkles size={14} className="text-yellow-500" /> Wirtualny Plac Zabaw
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-black italic tracking-tighter uppercase leading-[1.1] mb-6 pr-4">
                Odkryj potężną <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 pr-4">Strefę Zabawy</span>
              </h2>
            
            <p className="text-zinc-600 text-lg md:text-xl font-medium mb-8">
              Sklep Urwis to nie tylko zakupy, to prawdziwe centrum rozrywki dla każdego malucha. Przenieś się do świata wirtualnych gier, opiekuj się wirtualnym zwierzakiem, sprawdź nasze proste kolorowanki i przenieś trójwymiarowego Urwisa do własnego pokoju!
            </p>

            <Link 
              href="/strefa-zabawy"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_40px_rgba(250,204,21,0.3)] uppercase italic"
            >
              Wejdź do gry <Smile size={24} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {/* Karty Atutów */}
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white hover:bg-white shadow-xl transition-all h-full flex flex-col">
              <Paintbrush className="text-[#0055ff] mb-4 size-10 shrink-0" />
              <h3 className="text-zinc-900 font-black text-xl uppercase italic mb-2">Kolorowanki</h3>
              <p className="text-zinc-500 text-sm font-medium">Prosta aplikacja do kolorowania w przeglądarce, stworzona dla najmłodszych.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white hover:bg-white shadow-xl transition-all h-full flex flex-col">
              <Smile className="text-yellow-500 mb-4 size-10 shrink-0" />
              <h3 className="text-zinc-900 font-black text-xl uppercase italic mb-2">Wirtualny Urwis</h3>
              <p className="text-zinc-500 text-sm font-medium">Baw się i karm Urwiska. Zdobywaj punkty za aktywność!</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white hover:bg-white shadow-xl transition-all h-full flex flex-col">
              <Target className="text-[#BF2024] mb-4 size-10 shrink-0" />
              <h3 className="text-zinc-900 font-black text-xl uppercase italic mb-2">Urwis w Twoim pokoju</h3>
              <p className="text-zinc-500 text-sm font-medium">Przenieś wirtualnego Urwisa do swojego pokoju, możesz obrócić go i przesuwać po podłodze!</p>
            </div>

            <div className="bg-zinc-100/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col items-center justify-center text-center grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 h-full min-h-[160px]">
              <span className="text-zinc-400 font-black uppercase tracking-widest text-sm">Więcej gier wkrótce...</span>
            </div>
          </motion.div>

        </div>
      </div>
  );
}
