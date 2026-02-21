'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gamepad2, 
  Backpack, 
  PartyPopper, 
  Puzzle, 
  ChevronRight,
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    id: "zabawki",
    title: "Świat Zabawek",
    desc: "Największy wybór klocków LEGO, lalek Barbie i aut Hot Wheels w Białobrzegach. Wybieramy zabawki, które bawią i uczą.",
    icon: Puzzle,
    color: "#BF2024",
    size: "lg", 
    href: "/oferta/zabawki"
  },  
  {
    id: "szkola",
    title: "Szkoła i Biuro",
    desc: "Kompletna wyprawka szkolna, plecaki i artykuły biurowe dla firm. Wszystko, czego potrzebuje uczeń i Twoje biuro.",
    icon: Backpack,
    color: "#0055ff",
    size: "md",
    href: "/oferta/szkola-i-biuro"
  },
  {
    id: "imprezy",
    title: "Artykuły Imprezowe",
    desc: "Balony z helem, dekoracje urodzinowe i przebrania. Sprawimy, że każda impreza w Białobrzegach będzie wyjątkowa.",
    icon: PartyPopper,
    color: "#f59e0b",
    size: "md",
    href: "/oferta/imprezy"
  },
  {
    id: "gry",
    title: "Gry i Puzzle",
    desc: "Gry planszowe Rebel, puzzle Trefl i karty Pokemon. Idealny sposób na rodzinne wieczory bez ekranów.",
    icon: Gamepad2,
    color: "#06B6D4",
    size: "md",
    href: "/oferta/gry"
  },
  {
    id: "uslugi",
    title: "Usługi i Balony",
    desc: (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 group/line">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7a4f85] mt-2 group-hover/line:scale-150 transition-transform" />
          <p className="text-zinc-700 font-bold leading-tight">
            Profesjonalne <span className="text-[#7a4f85] font-black">pompowanie balonów helem</span>.
          </p>
        </div>
        <div className="flex items-start gap-2 group/line">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7a4f85] mt-2 group-hover/line:scale-150 transition-transform" />
          <p className="text-zinc-700 font-bold leading-tight">
            Ekspresowa <span className="text-[#7a4f85] font-black">laminacja podręczników</span>.
          </p>
        </div>
      </div>
    ),
    icon: Zap,
    color: "#7a4f85",
    size: "md", 
    href: "/o-nas"
  },
]

export default function OfertaContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const trackCategoryClick = (categoryId: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'select_content', {
        'content_type': 'category',
        'content_id': categoryId
      });
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      <section id="oferta" className="relative py-12 bg-transparent overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          
          {/* Nagłówek Sekcji */}
          <div className="mb-16 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm text-[#bf2024] rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white"
            >
              <Star size={14} fill="currentColor" /> Twoje Centrum Zabawy w Białobrzegach
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-8xl font-black text-zinc-900 mb-6 tracking-tighter uppercase leading-none"
            >
              WIĘCEJ NIŻ <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">ZABAWKI</span>
            </motion.h2>
            <p className="text-zinc-600 max-w-2xl text-xl font-bold uppercase tracking-tight leading-tight">
              Odkryj królestwo Urwisa przy ul. Reymonta 38A. Od klocków LEGO po wyprawki szkolne i balony z helem.
            </p>
          </div>

          {/* Grid Kategorii */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[220px]">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`
                  group relative rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500
                  bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg
                  hover:bg-white/40 hover:border-white/60 hover:shadow-2xl
                  min-h-[280px] md:min-h-0
                  ${cat.size === 'lg' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
                `}
              >
                <div 
                  className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20"
                  style={{ backgroundColor: cat.color }}
                />

                <cat.icon 
                  className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" 
                  size={cat.size === 'lg' ? 320 : 180} 
                  style={{ color: cat.color }}
                  aria-hidden="true"
                />

                <div className="relative z-10 h-full flex flex-col p-8 pb-10">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20"
                    style={{ backgroundColor: cat.color }}
                  >
                    <cat.icon className="text-white" size={24} aria-hidden="true" />
                  </div>

                  <h3 className="font-black uppercase tracking-tighter leading-none mb-3 text-2xl md:text-3xl text-zinc-900">
                    {cat.title}
                  </h3>
                  
                  <div className="font-bold leading-tight max-w-[90%] flex-1 text-zinc-600 text-sm md:text-base">
                    {cat.desc}
                  </div>

                  <Link 
                    href={cat.href}
                    onClick={() => trackCategoryClick(cat.id)}
                    aria-label={`Sprawdź naszą ofertę w kategorii: ${cat.title}`}
                    className="inline-flex items-center gap-2 font-black text-xs lg:text-sm uppercase tracking-widest transition-all group-hover:gap-4 mt-6 md:mt-4"
                    style={{ color: cat.color }}
                  >
                    Sprawdź ofertę <ChevronRight size={16} strokeWidth={3} aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}