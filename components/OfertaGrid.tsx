'use client'

import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Backpack, 
  PartyPopper, 
  Puzzle, 
  ChevronRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    title: "Świat Zabawek",
    desc: "Najlepsze klocki, lalki i figurki w Białobrzegach, które pobudzają wyobraźnię dziecka.",
    icon: Puzzle,
    color: "#BF2024",
    size: "lg", 
    href: "/oferta/zabawki"
  },  
  {
    title: "Artykuły Szkolne i Biurowe",
    desc: "Kompletna wyprawka szkolna i artykuły biurowe w Białobrzegach.",
    icon: Backpack,
    color: "#0055ff",
    size: "md",
    href: "/oferta/szkola-i-biuro"
  },
  {
    title: "Akcesoria Imprezowe",
    desc: "Kolorowe dekoracje na każdą okazję. Sprawdź nasze akcesoria na urodziny i przyjęcia.",
    icon: PartyPopper,
    color: "#f59e0b",
    size: "md",
    href: "/oferta/imprezy"
  },
  {
    title: "Gry Planszowe",
    desc: "Gry rodzinne i edukacyjne, które zapewnią wieczory pełne emocji.",
    icon: Gamepad2,
    color: "#06B6D4",
    size: "md",
    href: "/oferta/gry"
  },
  {
    title: "Usługi i Balony z helem",
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
            Ekspresowa <span className="text-[#7a4f85] font-black">laminacja książek i zeszytów</span>.
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

export default function OfertaGrid() {
  return (
    <section id="oferta" className="relative py-24 bg-transparent overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Nagłówek Sekcji */}
        <div className="mb-16 text-center lg:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-black text-zinc-900 mb-6 tracking-tighter uppercase"
          >
            WIĘCEJ NIŻ <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">ZABAWKI</span>
          </motion.h2>
          <p className="text-zinc-600 max-w-2xl text-xl font-bold uppercase tracking-tight leading-tight">
            Odwiedź Urwisa w Białobrzegach – od klocków po wyprawki szkolne, znajdziesz u nas wszystko dla swojego dziecka.
          </p>
        </div>

        {/* Grid Kategorii - Bento Layout */}
        {/* POPRAWKA: md:auto-rows - na telefonach wysokość będzie auto (dostosowana do treści) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[220px]">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`
                group relative rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500
                bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
                hover:bg-white/40 hover:border-white/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]
                min-h-[280px] md:min-h-0
                ${cat.size === 'lg' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
              `}
            >
              {/* Kolorowa poświata w rogu */}
              <div 
                className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: cat.color }}
              />

              {/* Ikona w tle */}
              <cat.icon 
                className="absolute -right-4 -bottom-4 opacity-[0.1] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" 
                size={cat.size === 'lg' ? 320 : 180} 
                style={{ color: cat.color }}
              />

              {/* POPRAWKA: p-6 na mobile dla oszczędności miejsca, p-8 na desktopie */}
              <div className="relative z-10 h-full flex flex-col p-6 md:p-8 pb-8 md:pb-10">
                {/* Badge z ikoną */}
                <div 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20"
                  style={{ backgroundColor: cat.color }}
                >
                  <cat.icon className="text-white" size={24} />
                </div>

                {/* Tytuł i opis */}
                {/* POPRAWKA: mniejszy tekst tytułu na mobile (text-2xl) */}
                <h3 className="font-black uppercase tracking-tighter leading-none mb-3 text-2xl md:text-3xl text-zinc-900">
                  {cat.title}
                </h3>
                
                <div className="font-bold leading-tight max-w-[90%] flex-1 text-zinc-600 text-sm md:text-base">
                  {cat.desc}
                </div>

                {/* Link */}
                <Link 
                  href={cat.href}
                  className="inline-flex items-center gap-2 font-black text-xs lg:text-sm uppercase tracking-widest transition-all group-hover:gap-4 mt-6 md:mt-4"
                  style={{ color: cat.color }}
                >
                  Sprawdź ofertę <ChevronRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}