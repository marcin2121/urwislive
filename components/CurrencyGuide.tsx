'use client'

import { motion } from 'framer-motion'
import { Crown, Gamepad2, Zap, ArrowRight, Star, Trophy, Percent, User, Palette, Image as ImageIcon, BrainCircuit, Calendar, Coffee, Ticket, Coins, Lock, Store, Rocket } from 'lucide-react'

const URWIS_RED = '#bf2024';
const URWIS_BLUE = '#0055ff';

const BentoCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, scale: 1.01 }}
    className={`relative overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
)

export default function CurrencyGuide() {
  return (
    <section className="relative w-full py-24 px-6 overflow-hidden bg-white">
      
      {/* TŁO */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${URWIS_RED} 2px, transparent 2px)`, backgroundSize: '30px 30px' }} 
      />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- NAGŁÓWEK --- */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0 }} 
            whileInView={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 rounded-full mb-6 border-2 border-red-100 bg-red-50 text-[#bf2024]"
          >
            <Crown size={32} className="animate-bounce" />
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black font-heading text-zinc-900 italic uppercase tracking-tighter mb-6 transform -rotate-1">
            Skarbiec <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${URWIS_RED}, ${URWIS_BLUE})` }}>Urwisa</span>
          </h2>
          
          <p className="text-zinc-500 text-xl font-bold max-w-2xl mx-auto leading-relaxed">
            Witaj w bazie, młody bohaterze! Zbieraj <span style={{ color: URWIS_RED }}>Złote Urwisy</span> za zakupy i <span style={{ color: URWIS_BLUE }}>Kuleczki</span> za gry, by odblokować super moce!
          </p>
        </div>

        {/* --- UKŁAD BENTO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* =====================================================================================
              1. ZŁOTE URWISY (LEWA STRONA)
             ===================================================================================== */}
          <BentoCard className="lg:col-span-7 bg-white border-2 border-red-100 group flex flex-col">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-20"
                  style={{ background: `linear-gradient(to bottom left, ${URWIS_RED}, transparent)` }} />

             <div className="p-8 md:p-12 relative flex-1 flex flex-col h-full">
                
                {/* Header Karty */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                  <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 border-4 border-white shrink-0"
                       style={{ background: `linear-gradient(135deg, ${URWIS_RED}, #d92e34)` }}>
                    <Crown size={44} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="bg-red-50 border border-red-100 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest inline-block mb-2" style={{ color: URWIS_RED }}>
                      Waluta Realna
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black italic uppercase leading-none text-zinc-900">
                      Złote Urwisy
                    </h3>
                  </div>
                </div>

                {/* PROCES ZDOBYWANIA */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 mb-10">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Warunek</span>
                         <div className="text-lg font-bold leading-tight">
                            Za każde <span className="text-3xl font-black inline-block" style={{ color: URWIS_RED }}>10 zł</span><br/>
                            wydane w <span className="underline decoration-2 decoration-red-200">Sklepie Urwis</span>
                         </div>
                      </div>
                      <ArrowRight className="text-zinc-300 hidden md:block" size={32} />
                      <div className="flex flex-col md:text-right">
                         <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Otrzymujesz</span>
                         <span className="text-3xl font-black text-amber-400 drop-shadow-sm">1 Złoty Urwis</span>
                      </div>
                   </div>
                </div>

                {/* --- SEKCJA PRZELICZNIKA (WYŚRODKOWANA) --- */}
                <div className="flex-1">
                  <div className="text-center mb-1">
                      <div className="flex items-center justify-center gap-4 mb-2">
                         <span className="text-3xl md:text-4xl font-black text-amber-400">1 Złoty Urwis</span>
                         <span className="text-xl md:text-2xl font-bold text-zinc-300">=</span>
                         <span className="text-3xl md:text-4xl font-black text-amber-300">1 zł</span>
                      </div>
                      <div className="text-[14px] font-black uppercase text-zinc-400 tracking-widest">
                        do wydania w
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BOKS 1: LECĘ W KULKI */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 transition-all hover:bg-blue-50">
                       <div className="flex text-center items-center gap-3 mb-4">
                          <h4 className="text-sm text-center font-black uppercase tracking-wide text-[#0055ff]">Lecę w Kulki</h4>
                       </div>
                       <ul className="space-y-2">
                          <li className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-blue-100/50">
                             <Ticket size={16} className="text-[#0055ff] shrink-0"/>
                             <span className="text-xs font-bold text-zinc-700">Wstęp na Salę Zabaw</span>
                          </li>
                          <li className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-blue-100/50">
                             <Coffee size={16} className="text-amber-600 shrink-0"/>
                             <span className="text-xs font-bold text-zinc-700">Kawa i Ciacho</span>
                          </li>
                          <li className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-blue-100/50">
                             <Coins size={16} className="text-purple-600 shrink-0"/>
                             <span className="text-xs font-bold text-zinc-700">Żetony do maszyn Arcade</span>
                          </li>
                       </ul>
                    </div>

                    {/* BOKS 2: SKLEP URWIS */}
                    <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 transition-all hover:bg-red-50">
                       <div className="flex items-center gap-3 mb-4">
                          <h4 className="text-sm font-black uppercase tracking-wide text-[#bf2024]">Sklep Urwis</h4>
                       </div>
                       <ul className="space-y-2">
                          <li className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-red-100/50">
                             <Store size={16} className="text-[#bf2024] shrink-0"/>
                             <span className="text-xs font-bold text-zinc-700">Zabawki, Gry i Klocki</span>
                          </li>
                          <li className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-sm border border-red-100/50">
                             <Star size={16} className="text-amber-500 shrink-0"/>
                             <span className="text-xs font-bold text-zinc-700">Artykuły szkolne i biurowe</span>
                          </li>
                       </ul>
                    </div>
                  </div>
                </div>

                {/* CIEKAWOSTKA */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-4">
                  <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600 shrink-0 shadow-inner">
                    <Percent size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-yellow-700 tracking-widest mb-1">Super Ciekawostka!</div>
                    <p className="text-sm font-medium text-yellow-900 leading-tight italic">
                      Za każdy zakup powyżej 10 zł otrzymujesz <span className="font-black bg-yellow-200 px-1 rounded">do 10% rabatu</span> do wykorzystania w Lecę w Kulki lub w Sklepie Urwis!
                    </p>
                  </div>
                </div>
             </div>
          </BentoCard>

          {/* =====================================================================================
              2. PRAWA STRONA (KULECZKI + EXP)
             ===================================================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* KULECZKI */}
            <BentoCard delay={0.1} className="flex-1 bg-white border-2 border-blue-50 group flex flex-col shadow-blue-500/5">
              <div className="p-8 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-60" />
                
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                       style={{ backgroundColor: URWIS_BLUE }}>
                    <Gamepad2 size={32} />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-50 text-[#0055ff] text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                    Wirtualny Świat
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-3xl font-black italic uppercase text-zinc-900 mb-2">Kuleczki</h3>
                  <p className="text-zinc-500 text-sm font-bold">
                    Waluta cyfrowa zbierana za misje w aplikacji. Pokaż wszystkim swoją moc online!
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 flex-1">
                   <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3 block">Jak zdobywać?</span>
                      <ul className="grid grid-cols-2 gap-2">
                        <li className="flex items-center gap-2 text-xs font-bold text-zinc-600"><BrainCircuit size={14}/> Quizy</li>
                        <li className="flex items-center gap-2 text-xs font-bold text-zinc-600"><Star size={14}/> Gry Memory</li>
                        <li className="flex items-center gap-2 text-xs font-bold text-zinc-600"><Calendar size={14}/> Codzienny Login</li>
                      </ul>
                   </div>
                   <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3 block">Na co wymienić?</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-[11px] font-bold text-zinc-700 shadow-sm"><User size={12} className="text-purple-500"/> Awatary</span>
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-[11px] font-bold text-zinc-700 shadow-sm"><Palette size={12} className="text-pink-500"/> Kolorowy Nick</span>
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-[11px] font-bold text-zinc-700 shadow-sm"><ImageIcon size={12} className="text-indigo-500"/> Tła Profilu</span>
                      </div>
                   </div>
                </div>
              </div>
            </BentoCard>

            {/* EXP (LEVEL) */}
            <BentoCard delay={0.2} className="bg-zinc-900 text-white border-2 border-zinc-900 group">
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
               <div className="p-8 relative z-10 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                      <Zap size={32} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-white leading-none">Wbijaj poziomy</h3>
                      <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">EXP (Doświadczenie)</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                       <Lock size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                       <div className="text-sm font-medium text-zinc-300 leading-snug">
                          Wbijaj poziomy, aby odblokować <span className="text-white font-bold">Legendarne Nagrody</span> za Kuleczki! Im wyższy Level, tym lepsze nagrody dostępne do kupienia za Kuleczki.
                       </div>
                    </div>
                  </div>
               </div>
            </BentoCard>

          </div>
        </div>

        {/* --- CALL TO ACTION --- */}
        <div className="mt-20 text-center">
           <button className="group relative inline-flex items-center gap-4 px-10 py-5 text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                   style={{ backgroundColor: URWIS_RED, boxShadow: `0 15px 35px -10px ${URWIS_RED}60` }}>
             <span>SPRAWDŹ SWÓJ SKARBIEC</span>
             <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>

      </div>
    </section>
  )
}