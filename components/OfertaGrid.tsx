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
    desc: "Najlepsze klocki, lalki i figurki, które pobudzają wyobraźnię.",
    icon: Puzzle,
    color: "#BF2024",
    size: "lg", 
    href: "/oferta/zabawki"
  },  
  {
    title: "Wyprawka Szkolna",
    desc: "Plecaki i przybory dla małych geniuszy.",
    icon: Backpack,
    color: "#0055ff",
    size: "md",
    href: "/oferta/szkola"
  },
  {
    title: "Akcesoria Imprezowe",
    desc: "Balony i dekoracje na każdą okazję.",
    icon: PartyPopper,
    color: "#f59e0b",
    size: "md",
    href: "/oferta/imprezy"
  },
  {
    title: "Gry Planszowe",
    desc: "Rodzinne wieczory pełne emocji.",
    icon: Gamepad2,
    color: "#06B6D4",
    size: "md",
    href: "/oferta/gry"
  },
  {
    title: "Nasze usługi:",
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
            Od klocków po wyprawki – w Urwisie znajdziesz wszystko, czego potrzebuje Twój mały bohater.
          </p>
        </div>

        {/* Grid Kategorii - Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px]">
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
                ${cat.size === 'header' ? 'md:col-span-2 md:row-span-1 bg-linear-to-br from-white/40 to-white/10' : ''}
                ${cat.size === 'lg' ? 'md:col-span-2 md:row-span-2' : ''}
                ${cat.size === 'md' ? 'md:col-span-2 md:row-span-1' : ''}
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

              <div className="relative z-10 h-full flex flex-col p-8 pb-10">
                {/* Badge z ikoną */}
                <div 
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20 ${cat.size === 'header' ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: cat.color }}
                >
                  <cat.icon className="text-white" size={24} />
                </div>

                {/* Tytuł i opis */}
                <h3 className={`font-black uppercase tracking-tighter leading-none mb-3 ${cat.size === 'header' ? 'text-4xl text-[#BF2024]' : 'text-3xl text-zinc-900'}`}>
                  {cat.title}
                </h3>
                
                {/* NAPRAWA: Zmieniono <p> na <div>, aby uniknąć błędów zagnieżdżania div w p */}
                <div className={`font-bold leading-tight max-w-[90%] flex-1 ${cat.size === 'header' ? 'text-zinc-800 text-lg' : 'text-zinc-600 text-sm md:text-base'}`}>
                  {cat.desc}
                </div>

                {/* Link - Ukryty dla kafelka "Nasze usługi:" */}
                {cat.title !== 'Nasze usługi:' && (
                  <Link 
                    href={cat.href}
                    className="inline-flex items-center gap-2 font-black text-xs lg:text-sm uppercase tracking-widest transition-all group-hover:gap-4 mt-4"
                    style={{ color: cat.color }}
                  >
                    Sprawdź ofertę <ChevronRight size={16} strokeWidth={3} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}