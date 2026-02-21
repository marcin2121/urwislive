'use client'

import { motion } from 'framer-motion'
import { Heart, Store, Coffee, GraduationCap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import MagicBento from '@/components/ui/MagicBento' 
import Particles from "@/components/Particles"

export default function AboutSection() {
  // Funkcja do śledzenia zdarzeń GTAG
  const trackAboutInteraction = (area: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'about_interaction', {
        'event_category': 'Engagement',
        'event_label': area
      });
    }
  };

  return (
    <main className="min-h-screen bg-transparent pt-40 pb-24 relative overflow-hidden text-zinc-900">
      
      {/* 🔴🔵 TŁO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          particleCount={30}
          particleColors={["#BF2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={200}
          speed={0.05}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="mb-32">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white/40 backdrop-blur-md text-zinc-500 rounded-full text-[12px] font-black uppercase tracking-[0.3em] mb-8 border border-white/50"
            >
              <Heart size={14} className="text-[#BF2024]" aria-hidden="true" /> Białobrzeska historia pasji
            </motion.span>
            
            <h1 className="text-7xl md:text-9xl font-black text-zinc-900 leading-[0.85] tracking-tight uppercase mb-12">
              WIĘCEJ NIŻ <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">
                TYLKO SKLEP
              </span>
            </h1>

            <p className="text-2xl md:text-4xl text-zinc-800 font-black leading-[1.1] uppercase tracking-tighter max-w-3xl">
              Urwis to <span className="text-[#BF2024]">energia Białobrzegów</span>, najlepsze artykuły szkolne i biurowe oraz bezkompromisowa <span className="text-[#0055ff]">radość odkrywania</span>.
            </p>
          </div>
        </section>

        {/* --- 3 KOLUMNY MAGIC BENTO --- */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* 1. SKLEP URWIS */}
            <MagicBento 
              glowColor="191, 32, 36" 
              enableTilt={false} 
              enableMagnetism={true}
              className="rounded-[3.5rem] bg-white/30 backdrop-blur-3xl border-2 border-white/70 shadow-2xl"
            >
              <div className="p-10 flex flex-col justify-between h-full min-h-[500px]">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#BF2024] rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-red-500/20">
                    <Store size={32} strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">SKLEP <br /> URWIS</h3>
                  <p className="text-lg text-zinc-600 font-bold uppercase leading-snug opacity-80">
                    Najlepsze zabawki oraz pełna gama artykułów szkolnych i biurowych w Białobrzegach.
                  </p>
                </div>
                <Link 
                  href="/oferta" 
                  onClick={() => trackAboutInteraction('shop_click')}
                  aria-label="Sprawdź ofertę zabawek i artykułów szkolnych"
                  className="relative z-10 flex items-center gap-3 font-black uppercase text-[11px] tracking-widest text-[#BF2024] mt-10 hover:gap-5 transition-all"
                >
                  Sprawdź ofertę <ChevronRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </MagicBento>

            {/* 2. LECĘ W KULKI */}
            <MagicBento 
              glowColor="0, 85, 255" 
              enableTilt={false} 
              enableMagnetism={true}
              className="rounded-[3.5rem] bg-white/30 backdrop-blur-3xl border-2 border-white/70 shadow-2xl"
            >
              <div className="p-10 flex flex-col justify-between h-full min-h-[500px]">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#0055ff] rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-500/20">
                    <Coffee size={32} strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 text-zinc-900">LECĘ <br /> W KULKI</h3>
                  <p className="text-lg text-zinc-600 font-bold uppercase leading-snug opacity-80">
                    Kawiarnia i sala zabaw dla dzieci. Idealne miejsce na kawę dla rodzica i szaleństwo dla urwisa.
                  </p>
                </div>
                <Link 
                  href="/salazabaw" 
                  onClick={() => trackAboutInteraction('playroom_click')}
                  aria-label="Odkryj salę zabaw Lecę w Kulki"
                  className="relative z-10 flex items-center gap-3 font-black uppercase text-[11px] tracking-widest text-[#0055ff] mt-10 hover:gap-5 transition-all"
                >
                  Odkryj salę <ChevronRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </MagicBento>

            {/* 3. AKADEMIA URWISA */}
            <MagicBento 
              glowColor="245, 158, 11" 
              enableTilt={false} 
              enableMagnetism={true}
              className="rounded-[3.5rem] bg-white/30 backdrop-blur-3xl border-2 border-white/70 shadow-2xl"
            >
              <div className="p-10 flex flex-col justify-between h-full min-h-[500px]">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center text-amber-950 mb-8 shadow-xl shadow-amber-500/20">
                    <GraduationCap size={32} strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">AKADEMIA <br /> URWISA</h3>
                  <div className="space-y-4">
                    <p className="text-xl text-amber-600 font-black uppercase tracking-tight leading-none">
                      NAUKA PRZEZ ZABAWĘ!
                    </p>
                    <p className="text-lg text-zinc-600 font-bold uppercase leading-tight">
                      Wspieramy rozwój dzieci w Białobrzegach poprzez kreatywne zadania i system nagród.
                    </p>
                  </div>
                </div>
                <Link 
                  href="https://akademiaurwisa.pl" 
                  target="_blank" 
                  onClick={() => trackAboutInteraction('academy_click')}
                  aria-label="Rozpocznij przygodę w Akademii Urwisa"
                  className="relative z-10 flex items-center gap-3 font-black uppercase text-[11px] tracking-widest text-amber-600 mt-10 hover:gap-5 transition-all"
                >
                  ROZPOCZNIJ QUEST <ChevronRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </MagicBento>

          </div>
        </section>

        {/* --- KONTAKT CTA --- */}
        <div className="text-center space-y-12 pb-12">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-zinc-900">
            WPADNIESZ <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">DO NAS?</span>
          </h2>
          <Link 
            href="/kontakt" 
            onClick={() => trackAboutInteraction('footer_cta_click')}
            aria-label="Przejdź do strony kontaktowej"
            className="group relative inline-flex items-center gap-4 px-16 py-8 bg-zinc-900 text-white rounded-full font-black text-2xl uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">ODWIEDŹ NAS W BIAŁOBRZEGACH</span>
          </Link>
        </div>

      </div>
    </main>
  )
}