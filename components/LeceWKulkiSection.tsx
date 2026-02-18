'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Coffee, Gamepad2, Cake, ShieldCheck, MapPin, 
  Search, ArrowUpRight, Facebook, Instagram, Map, Globe 
} from 'lucide-react'
import Image from 'next/image'
import Particles from './Particles'

export default function LeceWKulkiSection() {
    return (
      <section className="relative py-32 px-4 bg-white/20 backdrop-blur-md overflow-hidden z-[101] border-y border-white/30">
        
        {/* ✅ LOKALNE PARTICLES */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Particles
            particleCount={400}
            particleColors={["#5eb1ff", "#ff8ca8"]} 
            alphaParticles
            particleBaseSize={250}
            speed={0.1}
            sizeRandomness={0.8}
            particleSpread={8}
          />
        </div>
  
        <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- NAGŁÓWEK (POWIĘKSZONY) --- */}
        <div className="text-center mb-24 space-y-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md shadow-sm border border-blue-100 rounded-full text-xs font-black uppercase tracking-[0.2em] text-[#0055ff]"
          >
            <MapPin size={14} strokeWidth={3} /> Białobrzegi, ul. Targowicka 4
          </motion.div>
          
          <h2 className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tighter leading-none">
            Lecę w <span className="text-[#000000] drop-shadow-[0_2px_15px_rgba(94,177,255,0.4)]">Kulki</span>
          </h2>
          <p className="text-zinc-700 font-bold max-w-3xl mx-auto text-xl md:text-2xl uppercase tracking-tight leading-relaxed">
            Bezpieczna przystań dla malucha <br className="hidden md:block" /> i chwila spokoju dla rodzica.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEWA STRONA: ZDJĘCIE + MISJA + CTA */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="relative group">
              <a 
                href="https://lecewkulki.eu/" 
                target="_blank" 
                className="block relative rounded-[4rem] overflow-hidden bg-white shadow-[0_50px_100px_-20px_rgba(94,177,255,0.25)] transition-all duration-500 hover:shadow-[0_60px_120px_-25px_rgba(94,177,255,0.35)] border-2 border-white/50"
              >
                <div className="relative aspect-video">
                  <Image 
                    src="https://lecewkulki.eu/wp-content/uploads/2024/03/424976632_935741925221567_5357075754151531988_n.jpg"
                    alt="Sala Zabaw Lecę w Kulki"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                </div>
              </a>

              {/* PASEK CTA (POWIĘKSZONY) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-10">
                <SocialLink 
                  href="https://lecewkulki.eu/" 
                  icon={<Globe size={20}/>} 
                  label="WWW" 
                  baseColor="text-blue-600 border-blue-400/30 bg-white/50"
                  hoverColor="hover:bg-[#5eb1ff] hover:text-white"
                />
                <SocialLink 
                  href="https://www.facebook.com/salazabaw.lecewkulki" 
                  icon={<Facebook size={20}/>} 
                  label="Facebook" 
                  baseColor="text-[#1877F2] border-[#1877F2]/40 bg-white/50"
                  hoverColor="hover:bg-[#1877F2] hover:text-white"
                />
                <SocialLink 
                  href="https://www.instagram.com/lecew_kulki/" 
                  icon={<Instagram size={20}/>} 
                  label="Instagram" 
                  baseColor="text-[#ff8ca8] border-[#ff8ca8]/40 bg-white/50"
                  hoverColor="hover:bg-[#ff8ca8] hover:text-white"
                />
                <SocialLink 
                  href="https://maps.app.goo.gl/tu7RAMyKT6Hx5SMi9" 
                  icon={<Map size={20}/>} 
                  label="Mapa" 
                  baseColor="text-green-600 border-green-400/30 bg-white/50"
                  hoverColor="hover:bg-green-600 hover:text-white"
                />
              </div>
            </div>

            {/* OKIENKO MISJI (POWIĘKSZONE) */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="relative bg-white/50 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 shadow-2xl border-2 border-red-100 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#bf2024]/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-125" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                <div className="w-24 h-24 shrink-0 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-[#bf2024] border border-red-100 shadow-sm transition-transform group-hover:rotate-6">
                  <Search size={44} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 space-y-3">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-[#bf2024]/60">Urwis Quest</span>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 italic tracking-tight uppercase">ZNAJDŹ TAJNY KOD</h3>
                  <p className="text-zinc-700 text-lg font-bold leading-snug">
                    Na stronie <a href="https://lecewkulki.eu/" target="_blank" className="text-[#0055ff] font-black underline decoration-[#bf2024]/20 hover:decoration-[#bf2024] transition-all">Lecę w Kulki</a> ukryliśmy hasło. Znajdź je i wpisz na swoim <a href="https://sklep-urwis/profil/zrealizuj" target="_blank" className="text-[#0055ff] font-black underline decoration-[#bf2024]/20 hover:decoration-[#bf2024] transition-all">profilu </a>aby zgarnąć<span className= "font-black">+100 KULECZEK</span>.
                  </p>
                </div>

                <a 
                  href="https://lecewkulki.eu/" 
                  target="_blank"
                  className="shrink-0 w-20 h-20 bg-[#bf2024] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-all group-hover:shadow-red-500/30"
                >
                  <ArrowUpRight size={36} strokeWidth={3} />
                </a>
              </div>
            </motion.div>
          </div>

          {/* PRAWA STRONA: CECHY (POWIĘKSZONE) */}
          <div className="lg:col-span-5 space-y-6 lg:pl-10">
            <h3 className="text-3xl font-black text-zinc-900 mb-10 px-4 uppercase italic tracking-tight leading-none">
                Sala zabaw <br/><span className="text-blue-500">& kawiarnia</span>
            </h3>
            
            <FeatureItem 
              icon={<Gamepad2 className="text-[#5eb1ff]" />} 
              title="Kraina Urwisów" 
              desc="Wielopoziomowa konstrukcja i morze kulek. Raj dla każdego małego odkrywcy." 
            />
            <FeatureItem 
              icon={<Coffee className="text-orange-500" />} 
              title="Kawiarnia Szefa" 
              desc="Ty odpoczywasz przy kawie, a Twój Urwis szaleje w bezpiecznych warunkach." 
            />
            <FeatureItem 
              icon={<Cake className="text-[#ff8ca8]" />} 
              title="Epickie Urodziny" 
              desc="Tematyczny wysstrój i animatorzy, którzy sprawią, że ten dzień będzie misją życia." 
            />
            <FeatureItem 
              icon={<ShieldCheck className="text-green-500" />} 
              title="100% Bezpieczeństwa" 
              desc="Czystość i atestowane urządzenia. Spokój rodzica jest w cenie." 
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialLink({ href, icon, label, baseColor, hoverColor }: any) {
  return (
    <a 
      href={href} 
      target="_blank"
      className={`flex items-center gap-4 px-8 py-4 border-2 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg backdrop-blur-md ${baseColor} ${hoverColor} hover:scale-105 hover:border-transparent`}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

function FeatureItem({ icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ x: 15 }}
      className="flex gap-8 p-8 rounded-[3rem] bg-white/40 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
    >
      <div className="w-20 h-20 shrink-0 bg-white rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md border border-zinc-100">
        {/* Jawnym rzutowaniem na ReactElement z opcjonalnym size naprawiamy błąd overwritingu */}
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { 
          size: 32 
        })}
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="font-black text-zinc-900 uppercase tracking-tight text-xl mb-2 leading-none">{title}</h4>
        <p className="text-zinc-600 text-sm font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}