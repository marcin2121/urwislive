'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Backpack, 
  PartyPopper, 
  Puzzle, 
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const fullOffer = [
  {
    id: "zabawki",
    title: "Świat Zabawek",
    subtitle: "Dla dzieci w każdym wieku",
    desc: "Od klasycznych klocków LEGO i lalek Barbie, po najnowocześniejsze zabawki interaktywne i edukacyjne. Wybieramy produkty, które bawią i uczą jednocześnie.",
    icon: Puzzle,
    color: "#BF2024",
    items: ["Klocki LEGO", "Lalki i akcesoria", "Auta i tory", "Zabawki Pluszowe"],
  },
  {
    id: "szkola",
    title: "Wyprawka Szkolna",
    subtitle: "Wszystko do szkoły i biura",
    desc: "Przygotuj swojego ucznia na sukces! Oferujemy ergonomiczne plecaki, piórniki z wyposażeniem oraz pełną gamę artykułów piśmienniczych.",
    icon: Backpack,
    color: "#0055ff",
    items: ["Plecaki szkolne", "Zeszyty i bloki", "Przybory do pisania", "Akcesoria biurowe"],
  },
  {
    id: "imprezy",
    title: "Artykuły Imprezowe",
    subtitle: "Zorganizuj epickie party",
    desc: "Spraw, by każde urodziny były niezapomniane. Posiadamy ogromny wybór balonów (pompujemy helem!), serpentyn i dekoracji.",
    icon: PartyPopper,
    color: "#f59e0b",
    items: ["Balony z helem", "Dekoracje stołu", "Przebrania", "Świeczki urodzinowe"],
  },
  {
    id: "gry",
    title: "Gry i Puzzle",
    subtitle: "Rozrywka dla całej rodziny",
    desc: "Szeroki wybór gier planszowych, karcianych i zręcznościowych. Idealny sposób na wspólne spędzanie czasu bez komputera.",
    icon: Gamepad2,
    color: "#22c55e",
    items: ["Gry planszowe", "Puzzle", "Karty kolekcjonerskie", "Gry podróżne"],
  }
]

export default function OfertaPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Zabezpieczenie przed błędami hydracji
  if (!mounted) return <div className="min-h-screen bg-gray-50" />

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16 md:pt-40">
      <div className="container mx-auto px-6">
        
        {/* Przycisk Powrotu - z-index i pointer-events dla pewności kliknięcia */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 relative z-30"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#BF2024] transition-colors font-black text-xs uppercase tracking-widest pointer-events-auto"
          >
            <ArrowLeft size={16} /> Powrót do bazy
          </Link>
        </motion.div>

        {/* Nagłówek Sekcji */}
        <header className="mb-16 md:mb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 leading-tight">
              PEŁNE <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">WYPOSAŻENIE</span> <br />
              DLA URWISÓW
            </h1>
            <p className="text-xl text-zinc-600 font-medium leading-relaxed">
              W naszym sklepie stacjonarnym w Białobrzegach znajdziesz tysiące produktów. 
              Poniżej prezentujemy nasze główne misje asortymentowe.
            </p>
          </motion.div>
          
          <Sparkles className="absolute top-0 right-0 text-blue-200 hidden lg:block opacity-50" size={120} />
        </header>

        {/* Lista Kategorii */}
        <div className="space-y-12 md:space-y-24">
          {fullOffer.map((category, index) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
            >
              {/* Opis Kategorii */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <category.icon size={32} />
                  </div>
                  {/* Zwiększony odstęp między subtitle a title (gap-3) */}
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-black uppercase tracking-widest" style={{ color: category.color }}>
                      {category.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-zinc-900">
                      {category.title}
                    </h2>
                  </div>
                </div>

                <p className="text-lg text-zinc-600 font-medium leading-relaxed">
                  {category.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {category.items.map(item => (
                    <span key={item} className="px-4 py-2 bg-white rounded-full border border-zinc-200 text-sm font-bold text-zinc-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="pt-4 relative z-20">
                  <Link 
                    href={`/oferta/${category.id}`}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl pointer-events-auto"
                  >
                    Zobacz szczegóły <ChevronRight className="group-hover:translate-x-2 transition-transform" size={18} />
                  </Link>
                </div>
              </div>

              {/* Wizualny Placeholder / Zdjęcie */}
              <div className="flex-1 w-full aspect-square md:aspect-video lg:aspect-square relative rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-100 group">
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity z-10"
                  style={{ backgroundColor: category.color }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <category.icon size={120} className="text-zinc-300 opacity-30 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Dolna Sekcja Kontaktowa */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-12 rounded-[4rem] bg-zinc-900 text-white text-center relative overflow-hidden"
        >
          <div className="relative z-20">
            <h3 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tight">Nie znalazłeś czegoś?</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-10 text-lg font-medium">
              To tylko ułamek tego, co mamy na półkach. Zadzwoń lub odwiedź nas osobiście w Białobrzegach!
            </p>
            <div className="flex justify-center relative z-30">
               <Link 
                href="/kontakt" 
                className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform pointer-events-auto"
               >
                 Skontaktuj się
               </Link>
            </div>
          </div>
          {/* Tło dekoracyjne - pointer-events-none jest tu kluczowe */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#BF2024] rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0055ff] rounded-full blur-[120px]" />
          </div>
        </motion.div>
      </div>
    </main>
  )
}