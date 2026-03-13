'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  PenTool, 
  Backpack, 
  ChevronRight, 
  Palette,
  Briefcase,
  Users,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import Particles from "@/components/Particles";

const SCHOOL_CATEGORIES = [
  {
    id: "wyprawka",
    title: "Wyprawka Szkolna",
    brands: "Bambino, Astra, Oxford, Herlitz, Interdruk",
    desc: "Wszystko, czego potrzebuje uczeń: od pierwszego ołówka po profesjonalne zeszyty Oxford. Pomożemy Ci skompletować listę ze szkoły!",
    icon: <PenTool aria-hidden="true" />,
    accent: "#0055ff"
  },
  {
    id: "plecaki",
    title: "Plecaki i Tornistry",
    brands: "St.Right, CoolPack, Herlitz, Hama",
    desc: "Ergonomiczne, lekkie i wytrzymałe. Wybieramy modele dbające o kręgosłup Twojego dziecka z najmodniejszymi wzorami sezonu 2026.",
    icon: <Backpack aria-hidden="true" />,
    accent: "#BF2024"
  },
  {
    id: "plastyka",
    title: "Artykuły Plastyczne",
    brands: "Astra, Koh-I-Noor, Pentel, Faber-Castell",
    desc: "Farby, plasteliny, kredki i bloki. Najwyższa jakość dla małych artystów, która sprawi, że lekcje plastyki będą czystą radością.",
    icon: <Palette aria-hidden="true" />,
    accent: "#0055ff"
  },
  {
    id: "biuro",
    title: "Biuro i Firma",
    brands: "Papier ksero, segregatory, tusze, artykuły biurowe",
    desc: "Kompleksowe zaopatrzenie dla Twojego biura. Od papieru ksero po akcesoria do archiwizacji. Wystawiamy faktury VAT dla firm.",
    icon: <Briefcase aria-hidden="true" />,
    accent: "#BF2024"
  }
];

export default function SzkolaSection() {
  // Funkcja śledzenia zdarzeń GTAG
  const trackSchoolInteraction = (action: string, label: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        'event_category': 'Offer_School_Office',
        'event_label': label,
        'location': 'Białobrzegi'
      });
    }
  };

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      
      {/* 🟢 TŁO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          particleCount={60}
          particleColors={["#BF2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={180}
          speed={0.05}
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
            aria-label="Wróć do głównej oferty Sklepu Urwis"
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#0055ff] to-blue-600 text-white rounded-[2rem] font-black text-sm overflow-hidden transition-all hover:scale-105 shadow-xl uppercase tracking-tighter italic border-4 border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <ArrowLeft size={18} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
              Powrót do oferty
            </span>
          </Link>
        </motion.div>

        {/* --- HEADER --- */}
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl"
          >
            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">GOTOWI DO STARTU</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl pr-2 font-black text-zinc-900 mb-8 leading-[0.85] uppercase">
              SZKOŁA I <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0055ff] to-[#BF2024]">BIURO</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 font-bold leading-tight uppercase tracking-tight max-w-2xl">
              Od pierwszej klasy po profesjonalne biuro. Mamy wszystko, czego potrzebujesz, by odnieść sukces w Białobrzegach!
            </p>
          </motion.div>
        </header>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SCHOOL_CATEGORIES.map((cat, i) => (
            <motion.section
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white/30 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 border-2 border-white/60 shadow-xl hover:bg-white/40 transition-all duration-500 flex flex-col h-full"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 transition-all"
                style={{ backgroundColor: cat.accent }}
              >
                {cat.icon}
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 uppercase mb-4">
                {cat.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-6">
                 <CheckCircle2 size={14} className="text-[#0055ff]" aria-hidden="true" />
                 <p className="text-zinc-700 font-black text-xs leading-relaxed uppercase tracking-widest">
                  {cat.brands}
                 </p>
              </div>

              <p className="text-zinc-600 font-medium text-lg leading-snug mb-10 flex-grow">
                {cat.desc}
              </p>

              <Link 
                href="/kontakt"
                onClick={() => trackSchoolInteraction('szkola_klikniecie', `kategoria_${cat.id}`)}
                aria-label={`Zapytaj o artykuły z kategorii ${cat.title} w Białobrzegach`}
                className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-zinc-900 group-hover:gap-4 transition-all"
              >
                Sprawdź dostępność <ChevronRight size={16} strokeWidth={3} style={{ color: cat.accent }} aria-hidden="true" />
              </Link>
            </motion.section>
          ))}
        </div>

        {/* --- BANER DLA FIRM (SZKLANY) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 md:p-12 rounded-[3.5rem] bg-zinc-900/5 backdrop-blur-md border-2 border-dashed border-white/40 flex flex-col md:flex-row items-center gap-8 shadow-sm"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shrink-0 border border-zinc-100">
            <Briefcase className="text-[#0055ff]" size={40} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none">Zaopatrzenie dla firm i biur</h3>
            <p className="text-zinc-600 font-bold uppercase text-[11px] tracking-widest mt-2">
              Potrzebujesz papieru ksero, tonerów lub artykułów piśmienniczych na fakturę? Dostarczymy wszystko do Twojej firmy w Białobrzegach!
            </p>
          </div>
          <div className="md:ml-auto">
            <Link 
              href="tel:+48604208183"
              onClick={() => trackSchoolInteraction('szkola_klikniecie', 'telefon_b2b')}
              aria-label="Zadzwoń w sprawie zaopatrzenia biura"
              className="px-12 py-5 bg-zinc-900 text-white rounded-4xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all text-xs text-center block"
            >
              Zamów dla firmy
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  )
}