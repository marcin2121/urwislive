'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Cookie, Scale, Lock, ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function RegulaminPage() {
  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Nawigacja powrotna */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
            Wróć do strony głównej
          </Link>
        </motion.div>

        {/* Header */}
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tighter uppercase italic leading-none"
          >
            Polityka Prywatności <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">& Regulamin</span>
          </motion.h1>
          <p className="text-zinc-500 font-bold uppercase tracking-tight italic">
            Ostatnia aktualizacja: 19 lutego 2026 r.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 max-w-5xl">
          
          {/* IDENTYFIKACJA FIRMY - Kluczowe dla prawa */}
          <Section 
            icon={<Building2 className="text-blue-600" />} 
            title="1. Dane Administratora"
          >
            <p>Właścicielem serwisu oraz Administratorem Twoich danych osobowych jest:</p>
            <div className="mt-4 p-6 bg-white/30 rounded-3xl border border-white/50">
              <p className="font-black text-zinc-900 uppercase italic">Sklep Urwis</p>
              <p>ul. Reymonta 38A, 26-800 Białobrzegi</p>
              <p className="mt-2 text-sm font-bold">NIP: 7981093937 | REGON: 671959384</p>
              <p className="text-sm">E-mail: kontakt@sklep-urwis.pl</p>
              <p className="text-sm">Numer telefonu: 604208183</p>
            </div>
          </Section>

          <Section 
            icon={<ShieldCheck className="text-blue-600" />} 
            title="2. Cel Przetwarzania Danych"
          >
            <p>Twoje dane osobowe (np. imię, e-mail, numer telefonu) przetwarzane są wyłącznie w celach:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Obsługi zapytań wysyłanych przez formularz kontaktowy (podstawa prawna: prawnie uzasadniony interes Administratora).</li>
              <li>Realizacji rezerwacji w Sali Zabaw <strong>Lecę w Kulki</strong> oraz obsługi zamówień w <strong>Sklepie Urwis</strong>.</li>
              <li>Zapewnienia bezpieczeństwa działania serwisu i ochrony przed nadużyciami.</li>
            </ul>
          </Section>

          <Section 
            icon={<Cookie className="text-blue-600" />} 
            title="3. Pliki Cookies i Technologie Śledzące"
          >
            <p>Nasz serwis wykorzystuje technologię plików cookies. Dzielimy je na:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Niezbędne:</strong> Umożliwiające poprawne wyświetlanie strony, obsługę animacji intro oraz zapamiętanie Twoich ustawień prywatności.</li>
              <li><strong>Analityczne:</strong> Pomagające nam zrozumieć, jakie zabawki i usługi cieszą się największym zainteresowaniem (np. statystyki odwiedzin).</li>
            </ul>
            <p className="mt-4 italic">Zgodę na cookies możesz wycofać w dowolnym momencie, czyszcząc dane przeglądarki lub zmieniając ustawienia w naszym modalu prywatności.</p>
          </Section>

          <Section 
            icon={<Lock className="text-blue-600" />} 
            title="4. Twoje Prawa (RODO)"
          >
            <p>W związku z przetwarzaniem danych osobowych przysługuje Ci prawo do:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Dostępu do treści swoich danych oraz ich sprostowania.</li>
              <li>Usunięcia danych lub ograniczenia ich przetwarzania.</li>
              <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
              <li>Wniesienia skargi do organu nadzorczego (Prezesa Urzędu Ochrony Danych Osobowych).</li>
            </ul>
          </Section>

          <Section 
            icon={<Scale className="text-blue-600" />} 
            title="5. Postanowienia Końcowe"
          >
            <p>Korzystanie z witryny <strong>sklep-urwis.pl</strong> oznacza akceptację niniejszych zasad. W sprawach nieuregulowanych zastosowanie mają przepisy polskiego prawa, w tym Kodeksu Cywilnego oraz RODO.</p>
          </Section>

        </div>
      </div>
    </main>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          {icon}
        </div>
        <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">{title}</h2>
      </div>
      <div className="text-zinc-700 font-medium leading-relaxed text-lg">
        {children}
      </div>
    </motion.section>
  )
}