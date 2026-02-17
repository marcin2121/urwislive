'use client'

import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Backpack, 
  PartyPopper, 
  Puzzle, 
  BookOpen, 
  ChevronRight 
} from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    title: "Świat Zabawek",
    desc: "Najlepsze klocki, lalki i figurki, które pobudzają wyobraźnię.",
    icon: Puzzle,
    color: "#BF2024",
    size: "lg", 
    href: "/oferta/"
  },
  {
    title: "Wyprawka Szkolna",
    desc: "Plecaki i przybory dla małych geniuszy.",
    icon: Backpack,
    color: "#0055ff",
    size: "md",
    href: "/oferta/"
  },
  {
    title: "Akcesoria Imprezowe",
    desc: "Balony i dekoracje na każdą okazję.",
    icon: PartyPopper,
    color: "#f59e0b",
    size: "md",
    href: "/oferta/"
  },
  {
    title: "Gry Planszowe",
    desc: "Rodzinne wieczory pełne emocji.",
    icon: Gamepad2,
    color: "#22c55e",
    size: "sm",
    href: "/oferta/"
  },
  {
    title: "Kreatywny Kącik",
    desc: "Plastyka i nauka przez zabawę.",
    icon: BookOpen,
    color: "#a855f7",
    size: "sm",
    href: "/oferta/"
  }
]

export default function OfertaGrid() {
  return (
    // ✅ ZMIANA: bg-transparent, aby odsłonić particles
    <section id="oferta" className="relative py-24 bg-transparent overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Nagłówek Sekcji */}
        <div className="mb-16 text-center lg:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-black font-heading text-gray-900 mb-4 tracking-tight"
          >
            WIĘCEJ NIŻ <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">ZABAWKI</span>
          </motion.h2>
          <p className="text-gray-600 max-w-2xl font-body text-lg font-medium">
            Od klocków po wyprawki – w Urwisie znajdziesz wszystko, czego potrzebuje Twój mały bohater do codziennych przygód.
          </p>
        </div>

        {/* Grid Kategorii - Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px]">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className={`
                group relative rounded-[2.5rem] p-8 overflow-hidden cursor-pointer transition-all duration-500
                /* ✅ Glassmorphism: bg-white/40 + backdrop-blur */
                bg-white/40 backdrop-blur-md border-2 border-white/50 hover:border-white shadow-xl hover:shadow-2xl
                ${cat.size === 'lg' ? 'md:col-span-2 md:row-span-2' : ''}
                ${cat.size === 'md' ? 'md:col-span-2 md:row-span-1' : ''}
                ${cat.size === 'sm' ? 'md:col-span-1 md:row-span-1' : ''}
              `}
            >
              {/* Kolorowa poświata w rogu (Subtelny akcent kategorii) */}
              <div 
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: cat.color }}
              />

              {/* Ikona w tle (duża, lekko widoczna) */}
              <cat.icon 
                className="absolute -right-6 -bottom-6 opacity-[0.07] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" 
                size={cat.size === 'lg' ? 280 : 180} 
                style={{ color: cat.color }}
              />

              <div className="relative z-10 h-full flex flex-col">
                {/* Mini Ikonka z tłem */}
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-300"
                  style={{ backgroundColor: cat.color }}
                >
                  <cat.icon className="text-white" size={28} />
                </div>

                <h3 className="text-2xl lg:text-3xl font-black font-heading text-gray-900 mb-2 tracking-tight">
                  {cat.title}
                </h3>
                
                <p className="text-gray-600 font-body text-sm lg:text-base mb-6 flex-1 font-medium leading-relaxed max-w-[90%]">
                  {cat.desc}
                </p>

                <Link 
                  href={cat.href}
                  className="inline-flex items-center gap-2 font-black text-xs lg:text-sm uppercase tracking-widest transition-all group-hover:gap-4 group-hover:drop-shadow-sm"
                  style={{ color: cat.color }}
                >
                  Sprawdź ofertę <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}