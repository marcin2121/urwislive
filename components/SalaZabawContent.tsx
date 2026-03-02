'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coffee, Ticket, Gamepad2, ArrowRight, Utensils, 
  Cake, Clock, Crown, MapPin, Search, Globe, 
  Facebook, Instagram, Map, ShieldCheck, Star
} from 'lucide-react'
import Image from 'next/image'
import Particles from '@/components/Particles'
import LeceWKulkiSection from '@/components/LeceWKulkiSection'

const PASTEL_BLUE = "#5eb1ff";
const PASTEL_PINK = "#ff8ca8";

export default function SalaZabawContent() {
  // Funkcja śledzenia zdarzeń GTAG
  const trackPlayEvent = (action: string, label: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        'event_category': 'Playroom_Interaction',
        'event_label': label,
        'location': 'Białobrzegi'
      });
    }
  };

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden">
      
      {/* 🟢 PARTICLES */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={150}
          particleColors={[PASTEL_BLUE, PASTEL_PINK]}
          alphaParticles
          particleBaseSize={180}
          speed={0.04}
          sizeRandomness={0.8}
        />
      </div>

      <div className="relative z-10 w-full">
        <LeceWKulkiSection />

        {/* --- SYSTEM LOJALNOŚCIOWY --- */}
        <section className="relative py-24 px-4 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#bf2024]"
              >
                <Crown size={14} strokeWidth={3} aria-hidden="true" /> System Złotych Urwisów
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl pr-2 font-black text-zinc-900 tracking-tighter leading-none uppercase italic">
                Zabawa, która <span className="text-[#BF2024]">się opłaca</span>
              </h2>
              <p className="text-zinc-700 font-bold max-w-3xl mx-auto text-xl md:text-2xl uppercase tracking-tight italic">
                Złote Urwisy zebrane w sklepie zamienisz u nas na chwile relaksu i radości.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              <div className="lg:col-span-7 relative group">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="relative h-full min-h-[500px] md:min-h-[600px] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white/40 flex flex-col"
                >
                  <Image 
                    src="https://lecewkulki.eu/wp-content/uploads/2024/03/428350852_935827775212982_8031203923214966877_n.jpg"
                    alt="Lada kawiarni z widoczną ofertą - Lecę w Kulki Białobrzegi"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 z-0"
                  />
                  <div className="absolute inset-0 bg-black/10 z-10" />

                  <div className="relative md:absolute md:inset-8 z-20 flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/30 shadow-2xl">
                      <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left mb-8">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#bf2024] shadow-sm">
                          <Crown size={32} strokeWidth={2.5} aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[12px] font-black uppercase tracking-[0.4em] text-[#bf2024]">PROGRAM LOJALNOŚCIOWY</span>
                          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 italic leading-tight uppercase">Kupuj u Urwisa, <br/>baw się w Kulkach</h3>
                        </div>
                      </div>
                      <p className="text-zinc-900 text-lg font-bold leading-snug mb-10">
                        Za każde <span className="text-[#bf2024] font-black">10 zł</span> wydane w Sklepie Urwis dostajesz 1 Złotego Urwisa. U nas każdy punkt to <span className="font-black">1 zł zniżki</span> na bilety, kawę lub słodkości!
                      </p>
                      <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="bg-zinc-900 text-white px-8 py-3 rounded-2xl text-xl font-black italic shadow-lg">10 zł = 1 🟡</div>
                        <ArrowRight size={24} className="text-zinc-800 rotate-90 md:rotate-0" aria-hidden="true" />
                        <div className="bg-[#bf2024] text-white px-8 py-3 rounded-2xl text-xl font-black italic shadow-lg">1 🟡 = 1 zł</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                 <RewardItem 
                    icon={<Coffee size={32} className="text-orange-500" />} 
                    title="Napoje & Kawa" 
                    desc="Świeżo mielona kawa dla rodziców, zdrowe soki dla maluchów."
                 />
                 <RewardItem 
                    icon={<Cake size={32} className="text-[#ff8ca8]" />} 
                    title="Słodkie wypieki" 
                    desc="Codziennie świeże ciasta, gofry i legendarne rurki."
                 />
                 <RewardItem 
                    icon={<Ticket size={32} className="text-green-500" />} 
                    title="Bilety Wstępu" 
                    desc="Wymień punkty na darmowe godziny zabawy Twojego dziecka."
                 />
                 <RewardItem 
                    icon={<Gamepad2 size={32} className="text-[#5eb1ff]" />} 
                    title="Automaty Arcade" 
                    desc="Żetony do maszyn arcade dostępnych na sali."
                 />
              </div>
            </div>
          </div>
        </section>

        {/* --- INFO PRAKTYCZNE --- */}
        <section className="py-24 px-4 bg-white/5 backdrop-blur-sm border-y border-white/20">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6">
             <InfoCapsule icon={<MapPin size={20}/>} label="ul. Targowicka 4, Białobrzegi" />
             <InfoCapsule icon={<Clock size={20}/>} label="Codziennie: 11:00 - 19:00" />
             <InfoCapsule icon={<Utensils size={20}/>} label="Kawiarnia & Przekąski" />
          </div>
        </section>

        {/* --- FOOTER CTA --- */}
        <section className="py-32 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tighter leading-none uppercase italic">
              Wpadaj na <span className="text-[#0055ff]">Kawę!</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <a 
                 href="https://lecewkulki.eu/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 onClick={() => trackPlayEvent('external_link', 'lecewkulki_home')}
                 className="w-full sm:w-auto px-12 py-6 bg-[#0055ff] text-white rounded-4xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all text-center"
               >
                  Strona WWW lokalu
               </a>
               <a 
                 href="https://lecewkulki.eu/urodziny/" 
                 target="_blank" 
                 onClick={() => trackPlayEvent('external_link', 'birthday_booking')}
                 className="w-full sm:w-auto px-12 py-6 bg-white border-2 border-zinc-100 text-zinc-900 rounded-4xl font-black uppercase tracking-widest hover:bg-zinc-50 transition-all text-center shadow-xl"
               >
                  Zarezerwuj urodziny
               </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function RewardItem({ icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ x: 10 }}
      className="flex gap-6 p-6 rounded-[2.5rem] bg-white/30 backdrop-blur-md border border-white/40 hover:bg-white/60 transition-all group shadow-sm"
    >
      <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-zinc-50 text-zinc-900">
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="font-black text-zinc-900 uppercase tracking-tight text-lg mb-1">{title}</h4>
        <p className="text-zinc-600 text-xs font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function InfoCapsule({ icon, label }: any) {
  return (
    <div className="flex items-center gap-4 px-8 py-4 border border-white/40 rounded-4xl font-black text-[12px] md:text-xs uppercase tracking-[0.2em] bg-white/40 shadow-md text-zinc-700 backdrop-blur-md">
      <span className="text-[#0055ff]">{icon}</span>
      <span>{label}</span>
    </div>
  )
}