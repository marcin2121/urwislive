'use client'

import { motion } from 'framer-motion'
import { 
  Gamepad2, Trophy, Target, Zap, Star, ChevronRight, 
  Search, CheckCircle2, Gift, MousePointer2 
} from 'lucide-react'
import Link from 'next/link'
import Particles from "@/components/Particles"
import { RibbonsBg } from "@/components/Ribbons"
import Footer from '@/components/ui/Footer'

export default function GameCenterPage() {
  const categories = [
    {
      title: "Misje Agenta",
      desc: "Znajdź kody ukryte w sklepie i na stronie, aby zdobyć punkty.",
      href: "/misje",
      color: "#BF2024",
      size: "lg",
      // Podgląd: Lista zadań
      preview: (
        <div className="space-y-2 opacity-40 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="h-2 w-20 bg-white/20 rounded" />
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 ml-4">
            <CheckCircle2 size={12} className="text-green-500" />
            <div className="h-2 w-16 bg-white/20 rounded" />
          </div>
        </div>
      )
    },
    {
      title: "Urwis Quiz",
      desc: "Sprawdź wiedzę o zabawkach i zgarnij nagrody.",
      href: "/quiz",
      color: "#0055ff",
      size: "md",
      // Podgląd: Karta pytania
      preview: (
        <div className="relative bg-white/5 border border-white/10 rounded-xl p-3 transform -rotate-6 group-hover:rotate-0 transition-transform">
          <div className="h-2 w-full bg-blue-500/30 rounded mb-2" />
          <div className="grid grid-cols-2 gap-1">
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-blue-500/40 rounded" />
          </div>
        </div>
      )
    },
    {
      title: "Katalog Nagród",
      desc: "Wymień Kuleczki na realne rabaty i zabawki.",
      href: "/nagrody",
      color: "#f59e0b",
      size: "md",
      // Podgląd: Pływający kupon
      preview: (
        <div className="relative">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-linear-to-br from-yellow-400 to-orange-600 p-3 rounded-lg shadow-xl text-center"
          >
            <Gift size={20} className="text-white mx-auto mb-1" />
            <div className="text-[8px] font-black text-white">-20% RABAT</div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Szybkie Gry",
      desc: "Gierki zręcznościowe dla małych mistrzów.",
      href: "/gry/lista",
      color: "#a855f7",
      size: "sm",
      // Podgląd: Kursor i punkty
      preview: (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <MousePointer2 size={24} className="text-purple-400 animate-bounce" />
            <div className="absolute -top-4 -right-4 bg-white/10 px-2 py-1 rounded text-[8px] font-bold text-white">+100</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <main className="relative min-h-screen w-full bg-transparent overflow-x-hidden">
      
      {/* --- TŁO GAMER --- */}
      <div className="fixed inset-0 bg-zinc-950 -z-30" />
      <div className="fixed inset-0 pointer-events-none -z-20 opacity-30">
        <RibbonsBg colors={["#BF2024", "#0055ff", "#a855f7"]} />
      </div>
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles
          particleCount={100}
          particleColors={["#5eb1ff", "#ff8ca8", "#BF2024"]}
          alphaParticles
          particleBaseSize={120}
          speed={0.12}
        />
      </div>

      <div className="relative z-0">
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-md text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10"
            >
              <Star size={12} className="fill-yellow-400" /> Urwis Game Center
            </motion.div>
            
            <h1 className="text-7xl md:text-9xl font-black font-heading text-white tracking-tighter mb-8 italic uppercase leading-none">
              Baza <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] via-[#a855f7] to-[#0055ff]">Agenta</span>
            </h1>
          </div>
        </section>

        {/* --- BENTO HUB Z PODGLĄDAMI --- */}
        <section className="px-6 pb-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group relative rounded-[3rem] p-8 overflow-hidden border border-white/10 transition-all duration-500
                  ${cat.size === 'lg' ? 'md:col-span-2' : 'md:col-span-1'}
                  bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-800/60 hover:border-white/20
                `}
              >
                {/* Visual Preview Area (Top) */}
                <div className="absolute top-8 right-8 w-32 h-32 flex items-center justify-center">
                  {cat.preview}
                </div>

                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white font-heading uppercase italic tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-[240px]">
                      {cat.desc}
                    </p>
                    
                    <Link 
                      href={cat.href}
                      className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all group-hover:gap-4 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                      style={{ color: cat.color }}
                    >
                      Uruchom Misję <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ✅ Stopka w wersji ciemnej */}
        <Footer variant="dark" />
      </div>
    </main>
  );
}