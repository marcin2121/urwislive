'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Sparkles, ChevronRight, Trophy, MousePointer2 } from "lucide-react"
import Link from 'next/link'

export function AcademyPromo() {
  return (
    <section className="relative my-20 px-6">
      
      {/* 🚀 ZMIANA 1: Zamiast blur-[100px] używamy wydajnego gradientu css */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(191,32,36,0.1)_0%,rgba(0,85,255,0.1)_50%,transparent_100%)] rounded-[4rem] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="relative overflow-hidden bg-white/30 backdrop-blur-3xl border-2 border-white/70 rounded-[3.5rem] p-8 md:p-16 shadow-2xl will-change-transform"
      >
        {/* 🚀 ZMIANA 2: Dekoracyjne tła - Radial Gradients zamiast blur-3xl */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,85,255,0.08)_0%,transparent_70%)] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(191,32,36,0.08)_0%,transparent_70%)] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* LEWA STRONA: Treść */}
          <div className="space-y-8 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Nowość w świecie Urwisa!</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-900">
              AKADEMIA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">
                URWISA
              </span>
            </h2>

            <div className="text-xl text-zinc-600 font-bold leading-tight uppercase tracking-tight opacity-80">
              Twoje dziecko bawi się w naszej sali zabaw <a href='/salazabaw' className="text-[#0055ff]">Lecę w Kulki? </a> Pozwól mu kontynuować przygodę online! 
              <span className="text-zinc-900 block mt-2">Rozwiązuj quizy, zbieraj punkty i odbieraj nagrody w sklepie stacjonarnym.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link 
                href="https://akademiaurwisa.pl"
                target="_blank"
                className="group relative px-10 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all hover:scale-105 shadow-2xl overflow-hidden w-full sm:w-auto text-center"
              >
                {/* Zmieniłem bg-linear-to-r na bg-gradient-to-r (bezpieczniejsze w standardowym tailwind) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Przejdź do Akademii <GraduationCap size={20} />
                </span>
              </Link>
              
              <div className="flex items-center gap-3 text-zinc-400 font-black text-[12px] uppercase tracking-widest">
                <Trophy size={16} className="text-[#BF2024]" /> Punkty = Nagrody
              </div>
            </div>
          </div>

          {/* PRAWA STRONA: Grafika/Ikona */}
          <div className="relative group flex items-center justify-center">
            
            {/* 🚀 ZMIANA 3: Dodano will-change-transform do wciąż kręcących się elementów */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 md:w-80 md:h-80 border-2 border-dashed border-[#0055ff]/30 rounded-full will-change-transform"
            />
            
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 md:w-60 md:h-60 border-2 border-dashed border-[#BF2024]/30 rounded-full will-change-transform"
            />
            
            <div className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
               <motion.div
                 animate={{ y: [0, -15, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="will-change-transform"
               >
                 <GraduationCap className="w-32 h-32 md:w-40 md:h-40 text-zinc-900 drop-shadow-2xl" strokeWidth={1.5} />
               </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}