'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  PartyPopper, 
  Sparkles, 
  ChevronRight, 
  Gift,
  Circle,
  Flame,
  Music
} from 'lucide-react'
import Link from 'next/link'
import Particles from "@/components/Particles";

const PARTY_CATEGORIES = [
  {
    id: "balony",
    title: "Balony i Hel",
    highlight: "Pompujemy helem na miejscu!",
    desc: "Ogromny wybór balonów foliowych i lateksowych. Cyfry, postacie z bajek i eleganckie bukiety balonowe na każdą okazję.",
    icon: <Circle aria-hidden="true" />,
    accent: "#BF2024"
  },
  {
    id: "dekoracje",
    title: "Dekoracje Stołu",
    highlight: "Zestawy tematyczne i kolory",
    desc: "Talerzyki, kubeczki, serwetki i słomki. Od superbohaterów i księżniczek po eleganckie złoto, srebro i rose gold.",
    icon: <PartyPopper aria-hidden="true" />,
    accent: "#0055ff"
  },
  {
    id: "przebrania",
    title: "Przebrania i Gadżety",
    highlight: "Karnawał, Halloween, Tematyczne",
    desc: "Zmień się w kogo tylko chcesz! Posiadamy maski, peruki, kapelusze i okulary na każdą szaloną zabawę.",
    icon: <Music aria-hidden="true" />,
    accent: "#BF2024"
  },
  {
    id: "tort",
    title: "Świeczki i Torty",
    highlight: "Fontanny, race, świeczki-cyfry",
    desc: "Spraw, by moment zdmuchiwania świeczek był magiczny. Oferujemy fontanny tortowe, zimne ognie i efektowne race.",
    icon: <Flame aria-hidden="true" />,
    accent: "#0055ff"
  }
];

export default function ImprezySection() {
  // Funkcja śledzenia zdarzeń GTAG
  const trackPartyInteraction = (action: string, label: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'imprezy_interakcja', {
        'event_category': 'Offer_Party_2026',
        'event_label': label,
        'interaction_type': action,
        'location': 'Białobrzegi'
      });
    }
  };

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      
      {/* 🟢 TŁO */}
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
            aria-label="Wróć do pełnej oferty Sklepu Urwis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
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
            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">PARTY TIME: BIAŁOBRZEGI</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl pr-2 font-black text-zinc-900 mb-8 leading-[0.85] uppercase">
              ARTYKUŁY <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">IMPREZOWE</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 font-bold leading-tight uppercase tracking-tight max-w-2xl">
              Największy wybór balonów i dekoracji w regionie. Sprawiamy, że Twoje urodziny będą latać najwyżej!
            </p>
          </motion.div>
        </header>

        {/* --- GRID SZKLANYCH KOLEKCJI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PARTY_CATEGORIES.map((cat, i) => (
            <motion.section
              key={cat.id}
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

              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 uppercase mb-4">
                {cat.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-6">
                 <Sparkles size={14} className="text-[#BF2024]" aria-hidden="true" />
                 <p className="text-zinc-700 font-black text-xs leading-relaxed uppercase tracking-widest">
                  {cat.highlight}
                 </p>
              </div>

              <p className="text-zinc-600 font-medium text-lg leading-snug mb-10">
                {cat.desc}
              </p>

              <Link 
                href="/kontakt"
                onClick={() => trackPartyInteraction('imprezy_kategoria_klikniecie', cat.id)}
                aria-label={`Zamów produkty z kategorii ${cat.title} w Sklepie Urwis`}
                className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-zinc-900 group-hover:gap-4 transition-all"
              >
                {cat.id === 'balony' ? 'Zarezerwuj balony' : 'Sprawdź dostępność'} <ChevronRight size={16} strokeWidth={3} style={{ color: cat.accent }} aria-hidden="true" />
              </Link>
            </motion.section>
          ))}
        </div>

        {/* --- BANER HELOWY --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 md:p-12 rounded-[3.5rem] bg-zinc-900/5 backdrop-blur-md border-2 border-dashed border-white/40 flex flex-col md:flex-row items-center gap-8 shadow-sm"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shrink-0 border border-zinc-100">
            <Circle className="text-[#0055ff] fill-[#0055ff]/10" size={40} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none">Pompujemy balony helem!</h3>
            <p className="text-zinc-600 font-bold uppercase text-[11px] tracking-widest mt-2">
              Przynieś własne lub wybierz z naszej ogromnej kolekcji. Twoje balony będą latać najdłużej w Białobrzegach!
            </p>
          </div>
          <div className="md:ml-auto">
            <Link 
              href="tel:+48604208183"
              onClick={() => trackPartyInteraction('imprezy_cta_klikniecie', 'telefon_hel')}
              aria-label="Zadzwoń i zapytaj o balony z helem"
              className="px-12 py-5 bg-zinc-900 text-white rounded-4xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all text-xs text-center block"
            >
              Zadzwoń i zapytaj
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  )
}