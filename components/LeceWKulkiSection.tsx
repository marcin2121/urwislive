'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Coffee, Gamepad2, Cake, ShieldCheck, MapPin, 
  Facebook, Instagram, Map, Globe 
} from 'lucide-react'
import Image from 'next/image'

export default function LeceWKulkiSection() {
    const trackSocial = (platform: string) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'social_klikniecie', {
          'event_category': 'Social',
          'event_label': platform
        });
      }
    };

    return (
      <section className="relative py-32 px-4 bg-transparent overflow-hidden z-10 border-y border-white/10">
        <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-24 space-y-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#0055ff]"
          >
            <MapPin size={14} strokeWidth={3} aria-hidden="true" /> Białobrzegi, ul. Targowicka 4
          </motion.div>
          
          <h2 className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tighter leading-none uppercase">
            Lecę w <span className="italic text-[#0055ff]">Kulki</span>
          </h2>
          <p className="text-zinc-700 font-bold max-w-3xl mx-auto text-xl md:text-2xl uppercase tracking-tight leading-relaxed">
            Bezpieczna przystań dla malucha <br className="hidden md:block" /> i chwila spokoju dla rodzica.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-12">
            <div className="relative group">
              <a 
                href="https://lecewkulki.eu/" 
                target="_blank" 
                className="block relative rounded-[4rem] overflow-hidden bg-white shadow-2xl transition-all duration-500 border-2 border-white/50"
                aria-label="Odwiedź stronę Lecę w Kulki"
              >
                <div className="relative aspect-video">
                  <Image 
                    src="https://lecewkulki.eu/wp-content/uploads/2024/03/424976632_935741925221567_5357075754151531988_n.jpg"
                    alt="Sala zabaw dla dzieci - basen z kulkami i konstrukcje zabawowe"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
                </div>
              </a>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-10">
                <SocialLink 
                  href="https://lecewkulki.eu/" 
                  onClick={() => trackSocial('website')}
                  icon={<Globe size={20}/>} 
                  label="WWW" 
                  baseColor="text-blue-600 border-blue-400/30 bg-white/50"
                  hoverColor="hover:bg-[#0055ff] hover:text-white"
                />
                <SocialLink 
                  href="https://www.facebook.com/salazabaw.lecewkulki" 
                  onClick={() => trackSocial('facebook')}
                  icon={<Facebook size={20}/>} 
                  label="Facebook" 
                  baseColor="text-[#1877F2] border-[#1877F2]/40 bg-white/50"
                  hoverColor="hover:bg-[#1877F2] hover:text-white"
                />
                <SocialLink 
                  href="https://www.instagram.com/lecew_kulki/" 
                  onClick={() => trackSocial('instagram')}
                  icon={<Instagram size={20}/>} 
                  label="Instagram" 
                  baseColor="text-[#ff8ca8] border-[#ff8ca8]/40 bg-white/50"
                  hoverColor="hover:bg-[#ff8ca8] hover:text-white"
                />
                <SocialLink 
                  href="https://maps.app.goo.gl/rjxrBvjci7EWKmd87" 
                  onClick={() => trackSocial('maps')}
                  icon={<Map size={20}/>} 
                  label="Mapa" 
                  baseColor="text-green-600 border-green-400/30 bg-white/50"
                  hoverColor="hover:bg-green-600 hover:text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pl-10">
            <h3 className="text-3xl font-black text-zinc-900 mb-10 px-4 uppercase italic tracking-tight leading-none">
                Sala zabaw <br/><span className="text-[#0055ff]">& kawiarnia</span>
            </h3>

            <FeatureItem
              icon={<Gamepad2 className="text-[#5eb1ff]" />}
              title="Kraina Urwisów"
              desc="Wielopoziomowa konstrukcja i basen z kuleczkami. Raj dla każdego małego odkrywcy."
            />
            <FeatureItem
              icon={<Coffee className="text-orange-500" />}
              title="Kawiarnia Szefa"
              desc="Ty odpoczywasz przy aromatycznej kawie, a Twój Urwis szaleje w bezpiecznych warunkach."
            />
            <FeatureItem
              icon={<Cake className="text-[#ff8ca8]" />}
              title="Epickie Urodziny"
              desc="Tematyczny wystrój, animatorzy i misje urodzinowe, które zapadają w pamięć na lata."
            />
            <FeatureItem
              icon={<ShieldCheck className="text-green-500" />}
              title="Bezpieczeństwo"
              desc="Atestowane urządzenia i najwyższe standardy higieny. Spokój rodzica jest w cenie."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialLink({ href, icon, label, baseColor, hoverColor, onClick }: any) {
  return (
    <a 
      href={href} 
      target="_blank"
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-3 border-2 rounded-[2rem] font-black text-[14px] uppercase tracking-widest transition-all shadow-md backdrop-blur-md ${baseColor} ${hoverColor} hover:scale-105 hover:border-transparent`}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

function FeatureItem({ icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ x: 10 }}
      className="flex gap-6 p-6 rounded-[2.5rem] bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-all group shadow-sm"
    >
      <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-zinc-50">
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { 
          size: 28 
        })}
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="font-black text-zinc-900 uppercase tracking-tight text-lg mb-1 leading-none">{title}</h4>
        <p className="text-zinc-600 text-xs font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}