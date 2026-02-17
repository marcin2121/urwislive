'use client'

import { motion } from 'framer-motion'
import { 
  Coffee, Ticket, Gamepad2, ArrowRight, Utensils, 
  Cake, Clock, Crown, MapPin, Search
} from 'lucide-react'
import Image from 'next/image'

// IMPORT TWOICH KOMPONENTÓW
import LeceWKulkiSection from '@/components/LeceWKulkiSection'
import Particles from '@/components/Particles'

// PALETA PASTELOWA
const PASTEL_BLUE = "#5eb1ff";
const PASTEL_PINK = "#ff8ca8";

export default function SalaZabawPage() {
  return (
    <main className="min-h-screen bg-white relative">
      
      {/* 🟢 WARSTWA 1: GLOBALNE PARTICLES */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={300}
          particleColors={[PASTEL_BLUE, PASTEL_PINK]}
          alphaParticles
          particleBaseSize={200}
          speed={0.06}
          sizeRandomness={0.8}
          particleSpread={10}
        />
      </div>

      {/* ⚪ WARSTWA 2: TREŚĆ */}
      <div className="relative z-10 w-full">
        
        <LeceWKulkiSection />

        {/* --- SYSTEM LOJALNOŚCIOWY --- */}
        <section className="relative py-24 px-4 bg-white/20 backdrop-blur-md border-t border-white/30">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-20 space-y-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md shadow-sm border border-red-100 rounded-full text-xs font-black uppercase tracking-[0.2em] text-[#bf2024]"
              >
                <Crown size={14} strokeWidth={3} /> System Złotych Urwisów
              </motion.div>
              
              <h2 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-none">
                Zabawa, która <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(191,32,36,0.2)]">się opłaca</span>
              </h2>
              <p className="text-zinc-500 font-bold max-w-3xl mx-auto text-xl md:text-2xl uppercase tracking-tight">
                Złote Urwisy zebrane w sklepie, tutaj zamieniasz na chwilę relaksu.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              
              {/* --- LEWA STRONA: PHOTO + GLASS CONTAINER --- */}
              <div className="lg:col-span-7 relative group">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="relative h-full min-h-[600px] rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white/50"
                >
                  <Image 
                    src="https://lecewkulki.eu/wp-content/uploads/2024/03/428350852_935827775212982_8031203923214966877_n.jpg"
                    alt="Zabawa w Lecę w Kulki"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                  <div className="absolute inset-4 md:inset-10 flex items-center justify-center">
                    <div className="w-full max-w-2xl bg-white/35 backdrop-blur-3xl rounded-[3rem] p-10 md:p-14 border border-white/40 shadow-2xl flex flex-col justify-center">
                      
                      <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left mb-10">
                        <div className="w-20 h-20 shrink-0 bg-red-50 rounded-[2rem] flex items-center justify-center text-[#bf2024] border border-red-100 shadow-sm">
                          <Crown size={40} strokeWidth={2.5} />
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-[0.4em] text-[#bf2024]">OSZCZĘDZAJ Z NAMI</span>
                          <h3 className="text-4xl font-black text-zinc-900 italic tracking-[0.05em] leading-none uppercase">Kupuj w urwisie, <br/>baw się w kulkach</h3>
                        </div>
                      </div>

                      <p className="text-zinc-800 text-lg md:text-xl font-bold leading-snug mb-10 text-center md:text-left">
                        Za każde <span className="text-[#bf2024] font-black decoration-4 decoration-red-200">10 zł</span> wydane w Sklepie Urwis dostajesz 1 Złotego Urwisa. Tutaj każdy Złoty Urwis to <span className="text-amber-500 font-black">1 zł zniżki</span>!
                      </p>

                      <div className="pt-10 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="bg-zinc-900/90 text-white px-8 py-4 rounded-[2rem] text-2xl font-black italic shadow-lg">
                          10 zł = 1 🟡
                        </div>
                        <ArrowRight size={32} className="text-zinc-800 hidden md:block" />
                        <div className="bg-green-600/90 text-white px-8 py-4 rounded-[2rem] text-2xl font-black italic shadow-lg">
                          1 🟡 = 1 zł
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* --- PRAWA STRONA: LISTA NAGRÓD (POWIĘKSZONA) --- */}
              <div className="lg:col-span-5 space-y-6">
                 <RewardItem 
                   icon={<Coffee size={32} className="text-orange-500" />} 
                   title="Napoje" 
                   desc="Matcha latte czy świeżo parzona kawa?"
                 />
                 <RewardItem 
                   icon={<Cake size={32} className="text-[#ff8ca8]" />} 
                   title="Ciasto i przekąski" 
                   desc="Pyszne wypieki przygotowywane na miejscu codziennie."
                 />
                 <RewardItem 
                   icon={<Ticket size={32} className="text-green-500" />} 
                   title="Wstęp na Salę" 
                   desc="Wymień Złote Urwisy na bilet wstępu do krainy zabawy."
                 />
                 <RewardItem 
                   icon={<Gamepad2 size={32} className="text-[#5eb1ff]" />} 
                   title="Strefa Arcade" 
                   desc="Żetony do maszyn i automatów na całym parterze."
                 />
              </div>
            </div>
          </div>
        </section>

        {/* --- INFO PRAKTYCZNE (POWIĘKSZONE) --- */}
        <section className="py-24 px-4 bg-white/10 backdrop-blur-sm border-b border-white/30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6">
             <InfoCapsule icon={<MapPin size={22}/>} label="ul. Targowicka 4, Białobrzegi" />
             <InfoCapsule icon={<Clock size={22}/>} label="Codziennie: 11:00 - 19:00" />
             <InfoCapsule icon={<Utensils size={22}/>} label="Kawiarnia & Przekąski" />
          </div>
        </section>

        {/* --- FOOTER CTA --- */}
        <section className="py-32 px-4 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10 space-y-10">
            <h2 className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tighter leading-none">
              Wpadaj na <span className="text-[#0055ff]">Kawę!</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button className="w-full sm:w-auto px-12 py-6 bg-[#0055ff] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all text-sm">
                  Sprawdź swoje Urwisy
               </button>
               <button className="w-full sm:w-auto px-12 py-6 bg-white/80 backdrop-blur-md border-2 border-zinc-100 text-zinc-900 rounded-[2rem] font-black uppercase tracking-widest hover:bg-white transition-all text-sm shadow-xl">
                  Rezerwacje Urodzin
               </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

// --- POMOCNICZE KOMPONENTY Z WIĘKSZĄ SKALĄ ---

function RewardItem({ icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ x: 15 }}
      className="flex gap-8 p-8 rounded-[3rem] bg-white/40 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
    >
      <div className="w-20 h-20 shrink-0 bg-white rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md border border-zinc-100 text-zinc-900">
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="font-black text-zinc-900 uppercase tracking-tight text-xl mb-2">{title}</h4>
        <p className="text-zinc-500 text-sm font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function InfoCapsule({ icon, label }: any) {
  return (
    <div className="flex items-center gap-4 px-10 py-5 border-2 border-white/60 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] bg-white/60 shadow-lg text-zinc-700 backdrop-blur-md">
      <span className="text-blue-500">{icon}</span>
      <span>{label}</span>
    </div>
  )
}