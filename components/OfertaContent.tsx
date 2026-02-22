'use client'

import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Backpack, 
  PartyPopper, 
  Puzzle, 
  ChevronRight,
  Zap,
  Sparkles,
  Coins,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    title: "Klocki LEGO & Zabawki",
    desc: "Największe królestwo LEGO w Białobrzegach. Od serii Technic po City – dobierzemy zestaw, który wygra z każdym smartfonem.",
    icon: Puzzle,
    color: "#BF2024",
    size: "lg", 
    href: "/oferta/zabawki"
  },  
  {
    title: "Wyprawka Szkolna",
    desc: "Artykuły marek Oxford, Stabilo i Herlitz. Kompletujemy listy szkolne od A do Z, byś Ty nie musiała o niczym pamiętać.",
    icon: Backpack,
    color: "#0055ff",
    size: "md",
    href: "/oferta/szkola-i-biuro"
  },
  {
    title: "Party & Balony z Helem",
    desc: "Balony cyfry, postacie z bajek i hel od ręki. Tworzymy dekoracje, które zamienią salon w prawdziwą krainę przygód.",
    icon: PartyPopper,
    color: "#f59e0b",
    size: "md",
    href: "/oferta/imprezy"
  },
  {
    title: "Gry Planszowe & Edu",
    desc: "Najlepsze tytuły od Rebel i Trefl. Edukacyjne hity, które łączą pokolenia przy wspólnym stole.",
    icon: Gamepad2,
    color: "#06B6D4",
    size: "md",
    href: "/oferta/gry"
  },
  {
    title: "Usługi dla Rodziców",
    desc: (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 group/line">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7a4f85] mt-2 group-hover/line:scale-150 transition-all" />
          <p className="text-zinc-700 font-bold leading-tight uppercase text-xs md:text-sm">
             <span className="text-[#7a4f85] font-black italic">Pompowanie helem</span> na poczekaniu.
          </p>
        </div>
        <div className="flex items-start gap-2 group/line">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7a4f85] mt-2 group-hover/line:scale-150 transition-all" />
          <p className="text-zinc-700 font-bold leading-tight uppercase text-xs md:text-sm">
            Ekspresowa <span className="text-[#7a4f85] font-black italic">laminacja podręczników</span>.
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
        
        {/* NAGŁÓWEK SEKCJI */}
        <div className="mb-16 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-[#BF2024] font-black uppercase tracking-[0.3em] text-xs mb-4">
            <Sparkles size={14} /> <span>Eksperci od uśmiechu</span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-black text-zinc-900 mb-6 tracking-tighter uppercase italic leading-[0.9]"
          >
            WIĘCEJ NIŻ <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">ZABAWKI</span>
          </motion.h2>
          <p className="text-zinc-500 max-w-2xl text-xl font-bold uppercase tracking-tight italic leading-tight">
          Od klocków po wyprawki. W samym sercu Białobrzegów stworzyliśmy miejsce, gdzie jakość LEGO spotyka się z Twoim spokojem.
          </p>
        </div>

        {/* BENTO GRID KATEGORII */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[240px] mb-8">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`
                group relative rounded-4xl overflow-hidden cursor-pointer transition-all duration-500
                bg-white/30 backdrop-blur-xl border border-white/50 shadow-sm
                hover:bg-white/50 hover:border-white/80 hover:shadow-2xl
                min-h-[280px] md:min-h-0
                ${cat.size === 'lg' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
              `}
            >
              <div 
                className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: cat.color }}
              />

              <cat.icon 
                className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" 
                size={cat.size === 'lg' ? 320 : 180} 
                style={{ color: cat.color }}
              />

              <div className="relative z-10 h-full flex flex-col p-8 md:p-10">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20"
                  style={{ backgroundColor: cat.color }}
                >
                  <cat.icon className="text-white" size={28} />
                </div>

                <h3 className="font-black uppercase tracking-tighter leading-none mb-3 text-3xl text-zinc-900 italic">
                  {cat.title}
                </h3>
                
                <div className="font-bold leading-tight max-w-[95%] flex-1 text-zinc-500 text-sm md:text-base uppercase">
                  {cat.desc}
                </div>

                <Link 
                  href={cat.href}
                  className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all group-hover:gap-4 mt-6"
                  style={{ color: cat.color }}
                >
                  Odkryj teraz <ChevronRight size={16} strokeWidth={4} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

 {/* 🚀 BANER: SYSTEM ZŁOTYCH URWISÓW (Poprawiony wizualnie i merytorycznie) */}
 <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-4xl bg-white/20 backdrop-blur-2xl border border-white/50 p-8 md:p-12 overflow-hidden shadow-xl group"
        >
          {/* Poświaty w tle */}
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#BF2024]/10 rounded-full blur-3xl" />
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#0055ff]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="p-4 bg-white/80 rounded-2xl shadow-sm rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                  <Coins className="text-[#f59e0b]" size={40} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-1">Unikalna Przygoda</span>
                  <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-zinc-900">
                    Złote <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">Urwisy</span>
                  </h3>
                </div>
              </div>
              
              <p className="text-lg md:text-xl font-bold uppercase italic leading-tight text-zinc-600">
                Odbieraj złote monety za zakupy na <span className="text-zinc-900 underline decoration-[#BF2024]/30 decoration-4 underline-offset-4">ul. Reymonta 38A</span>! 
                Każdy <span className="text-zinc-900">Złoty Urwis</span> to Twoja przepustka do pysznej kawy i szaleństwa w <span className="text-zinc-900 underline decoration-[#0055ff]/30 decoration-4 underline-offset-4">Lecę w Kulki</span>.
              </p>
            </div>

            {/* Przelicznik monet */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="flex-1 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 text-center min-w-[190px]">
                <span className="block text-4xl font-black text-zinc-900 mb-1">10 zł</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Wydajesz w Urwisie</span>
                <div className="h-px w-8 bg-zinc-200 mx-auto my-3" />
                <div className="flex items-center justify-center gap-2">
                   <Coins size={16} className="text-[#f59e0b]" />
                   <span className="block text-sm font-black text-zinc-900 uppercase">1 Złoty Urwis</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center">
                <ArrowRight size={24} className="text-zinc-300" strokeWidth={3} />
              </div>

              <div className="flex-1 bg-white/80 p-6 rounded-3xl border border-white text-center min-w-[190px] shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                   <Coins size={24} className="text-[#f59e0b]" />
                   <span className="block text-2xl font-black text-zinc-900 uppercase italic">1 Moneta</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Zabierasz na salę</span>
                <div className="h-px w-8 bg-zinc-200 mx-auto my-3" />
                <span className="block text-xl font-black text-[#0055ff] uppercase">1 ZŁ RABATU</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center lg:justify-start">
             <Link 
                href="/regulamin" 
                className="group/link text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2"
              >
                Poznaj magię Złotych Urwisów <ChevronRight size={12} strokeWidth={3} className="group-hover/link:translate-x-1 transition-transform" />
             </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}