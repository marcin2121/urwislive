'use client'

import { motion } from 'framer-motion'
import { Coins, ArrowRight, Zap, Trophy, Smile, Store, Sparkles } from 'lucide-react'

export default function LoyaltySection() {
  return (
    <div className="h-full w-full relative">
      {/* 🚀 ZMIANA WYDAJNOŚCIOWA: Usunięto zacinające na telefonach blur-[130px] na rzecz gradientów radialnych */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[150%] md:w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(191,32,36,0.08)_0%,transparent_60%)] rounded-full -z-10 animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[150%] md:w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.08)_0%,transparent_60%)] rounded-full -z-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} // Uruchomi się chwilę przed przewinięciem do sekcji
          className="relative bg-white/30 backdrop-blur-xl border-2 border-white/70 rounded-[3rem] md:rounded-[4rem] p-6 md:p-12 shadow-2xl overflow-hidden will-change-transform h-full w-full box-border"
        >
          {/* Watermark w brandowym kolorze */}
          <Zap className="absolute -top-12 -right-12 text-[#0055ff]/5 rotate-12 pointer-events-none w-[300px] h-[300px] md:w-[400px] md:h-[400px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* --- LEWA STRONA: LOGIKA PROGRAMU --- */}
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-[#BF2024] mb-4 block">Program lojalnościowy</span>
                
                <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl pr-2 font-black uppercase tracking-tight leading-[0.85] text-zinc-900">
                  ZŁOTE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">
                    URWISY
                  </span>
                </h2>
                
                <p className="text-2xl text-zinc-600 font-bold uppercase tracking-tight leading-tight max-w-md">
                  To się opłaca! <br/> Kupując w Urwisie, zyskujesz <span className="text-zinc-900 underline decoration-[#0055ff] decoration-4 underline-offset-4 uppercase">ZŁOTE URWISY</span>. 
                </p>
              </div>

              {/* Kalkulator / Przelicznik */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/40 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white/60 shadow-inner group">
                <div className="text-center sm:text-left">
                  <div className="text-[12px] md:text-[12px] font-black text-zinc-700 uppercase tracking-widest mb-1">Wydajesz w Urwisie</div>
                  <div className="text-4xl md:text-5xl font-black text-[#bf2024] tracking-tighter">10 zł</div>
                </div>
                
                <div className="w-12 h-12 md:w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 rotate-90 sm:rotate-0 shadow-xl group-hover:scale-110 transition-transform">
                  <ArrowRight strokeWidth={3} className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                
                <div className="text-center sm:text-left">
                  <div className="text-[12px] md:text-[12px] font-black text-zinc-700 uppercase tracking-widest mb-1">Zyskujesz złotego urwisa</div>
                  <div className="text-4xl md:text-5xl font-black text-[#0055ff] tracking-tighter flex items-center justify-center sm:justify-start gap-2">
                    1 <Coins className="fill-[#0055ff]/20 w-8 h-8 md:w-10 md:h-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* --- PRAWA STRONA: GDZIE WYDAĆ (Czarna Tafla) --- */}
            <div className="relative">
              <div className="bg-zinc-900 text-white p-8 md:p-14 pb-16 md:pb-14 rounded-[3rem] md:rounded-[3.5rem] rotate-1 shadow-2xl relative z-10 border border-white/10 group hover:rotate-0 transition-transform duration-500 will-change-transform">
                <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-20 h-20 md:w-[120px] md:h-[120px]" />
                </div>

                <h3 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                  <Zap className="text-[#0055ff] fill-[#0055ff]" size={28} /> Gdzie wydać?
                </h3>
                
                <div className="text-zinc-400 font-medium text-lg leading-snug mb-10">
                  <h3 className="text-[#0055ff] font-black text-center text-xl"> 1 ZŁOTY URWIS = 1 zł </h3> 
                  <p className="mt-4">
                    do wydania na co tylko chcesz w Sali Zabaw <a href='/salazabaw' className="text-[white] font-black uppercase ">Lecę w Kulki</a>. Wymieniaj URWISY na żetony do gier, wejście do sali zabaw, świeżo parzoną kawę lub pyszne ciasto!
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#BF2024]"><Store size={16} /></div>
                    <span>Zbieraj w Sklepie Urwis</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-[#ffffff]">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#0055ff]"><Smile size={16} /></div>
                    <span>Wydawaj w Lecę w Kulki</span>
                  </div>
                </div>
              </div>

              {/* 🪙 Pływająca Moneta (Optymalizacja animacji) */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-2 md:-bottom-10 md:-right-6 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#BF2024] to-[#0055ff] rounded-full shadow-2xl flex items-center justify-center border-4 border-white z-20 will-change-transform"
              >
                <Coins className="text-white drop-shadow-lg w-9 h-9 md:w-[50px] md:h-[50px]" />
              </motion.div>
            </div>

          </div>
        </motion.div>
    </div>
  )
}