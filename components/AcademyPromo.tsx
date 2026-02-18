'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Sparkles, ChevronRight, Trophy, MousePointer2 } from "lucide-react"
import Link from 'next/link'

export function AcademyPromo() {
  return (
    <section className="relative my-20 px-6">
      {/* 🟢 NEONOWA POŚWIATA POD SPODEM (Glow) */}
      <div className="absolute inset-0 bg-linear-to-r from-[#BF2024]/20 to-[#0055ff]/20 blur-[100px] rounded-[4rem] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-white/30 backdrop-blur-3xl border-2 border-white/70 rounded-[3.5rem] p-8 md:p-16 shadow-2xl"
      >
        {/* Dekoracyjne elementy tła */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0055ff]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#BF2024]/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* LEWA STRONA: Treść */}
          <div className="space-y-8 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Nowość w świecie Urwisa!</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black  uppercase tracking-tighter leading-[0.85] text-zinc-900">
              AKADEMIA <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">
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
                className="group relative px-10 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all hover:scale-105 shadow-2xl overflow-hidden  w-full sm:w-auto text-center"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="relative group">
            {/* Animowane pierścienie wokół ikony */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-20px] border-2 border-dashed border-[#0055ff]/20 rounded-full"
            />
            
            <div className="w-48 h-48 md:w-64 md:h-64 bg-white/60 backdrop-blur-md rounded-[3rem] flex items-center justify-center shadow-2xl border-2 border-white transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
               <div className="relative">
                 <GraduationCap className="w-24 h-24 md:w-32 md:h-32 text-zinc-900" strokeWidth={1.5} />
                 <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                 >
                 </motion.div>
               </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}