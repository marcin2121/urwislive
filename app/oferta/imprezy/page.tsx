'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  PartyPopper, 
  Sparkles, 
  ChevronRight, 
  Info,
  Gift,
  Circle,
  Flame,
  Music
} from 'lucide-react'
import Link from 'next/link'
import Particles from "@/components/Particles";

const PARTY_CATEGORIES = [
  {
    title: "Balony i Hel",
    brands: "Pompujemy helem na miejscu!",
    desc: "Ogromny wybór balonów foliowych i lateksowych. Cyfry, postacie z bajek i eleganckie bukiety balonowe na każdą okazję.",
    icon: <Circle />,
    accent: "#BF2024"
  },
  {
    title: "Dekoracje Stołu",
    brands: "Talerzyki, kubeczki, serwetki, słomki",
    desc: "Stwórz spójny klimat imprezy dzięki gotowym zestawom tematycznym. Od superbohaterów po eleganckie złoto i srebro.",
    icon: <PartyPopper />,
    accent: "#0055ff"
  },
  {
    title: "Przebrania i Gadżety",
    brands: "Maski, peruki, kapelusze, okulary",
    desc: "Zmień się w kogo tylko chcesz! Posiadamy akcesoria na karnawał, Halloween oraz szalone wieczory tematyczne.",
    icon: <Music />,
    accent: "#BF2024"
  },
  {
    title: "Świeczki i Torty",
    brands: "Fontanny tortowe, race, świeczki-cyfry",
    desc: "Spraw, by moment zdmuchiwania świeczek był magiczny. Oferujemy klasyczne świeczki oraz efektowne race i fontanny.",
    icon: <Flame />,
    accent: "#0055ff"
  }
];

export default function ImprezyPage() {
  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      
      {/* 🟢 TŁO: Particles (Czerwono-Niebieskie) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          particleCount={70}
          particleColors={["#BF2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={180}
          speed={0.07}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- NAWIGACJA --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link 
            href="/oferta" 
            className="group inline-flex items-center gap-2 text-zinc-500 hover:text-[#BF2024] transition-all font-black text-xs uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
            Powrót do oferty
          </Link>
        </motion.div>

        {/* --- HEADER --- */}
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl"
          >
            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">Czas na świętowanie</span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-zinc-900 mb-8 leading-[0.85] tracking-tighter uppercase italic">
              ARTYKUŁY <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">IMPREZOWE</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 font-bold leading-tight italic uppercase tracking-tight max-w-2xl">
              Z nami każda okazja zamienia się w epickie wydarzenie. Największy wybór dekoracji i balonów w regionie!
            </p>
          </motion.div>
        </header>

        {/* --- GRID SZKLANYCH KOLEKCJI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PARTY_CATEGORIES.map((cat, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white/30 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 border-2 border-white/60 shadow-xl hover:bg-white/40 transition-all duration-500"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all"
                style={{ backgroundColor: cat.accent }}
              >
                {cat.icon}
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 uppercase italic tracking-tighter mb-4">
                {cat.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-6">
                 <Sparkles size={14} className="text-[#BF2024]" />
                 <p className="text-zinc-700 font-black text-xs leading-relaxed italic uppercase tracking-widest">
                  {cat.brands}
                 </p>
              </div>

              <p className="text-zinc-600 font-medium text-lg leading-snug mb-10">
                {cat.desc}
              </p>

              <Link 
                href="/kontakt"
                className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-zinc-900 group-hover:gap-4 transition-all"
              >
                Zarezerwuj balony <ChevronRight size={16} strokeWidth={3} style={{ color: cat.accent }} />
              </Link>
            </motion.section>
          ))}
        </div>

        {/* --- BANER HELOWY (SZKLANY) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 p-8 md:p-12 rounded-[3.5rem] bg-zinc-900/5 backdrop-blur-md border-2 border-dashed border-white/40 flex flex-col md:flex-row items-center gap-8 shadow-sm"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shrink-0 border border-zinc-100">
            <Circle className="text-[#0055ff] fill-[#0055ff]/10" size={40} strokeWidth={2.5} />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tight leading-none">Pompujemy balony helem!</h3>
            <p className="text-zinc-600 font-bold italic uppercase text-[11px] tracking-widest mt-2">
              Przynieś własne lub wybierz z naszej ogromnej kolekcji. Twoje balony będą latać najwyżej w Białobrzegach!
            </p>
          </div>
          <div className="md:ml-auto flex flex-col gap-2">
            <Link 
              href="tel:+48604208183"
              className="px-12 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all italic text-xs text-center"
            >
              Zadzwoń i zapytaj
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  )
}