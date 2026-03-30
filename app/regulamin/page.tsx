'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, Cookie, Scale, Lock, ArrowLeft, 
  Building2, Coins, ShoppingBag, Info 
} from "lucide-react"
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Wróć do bazy (Strona Główna)
          </Link>
        </motion.div>

        {/* Header */}
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tighter uppercase leading-[0.9]"
          >
            Informacje Prawne <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">& Regulaminy</span>
          </motion.h1>
          <p className="text-zinc-500 font-bold uppercase tracking-tight italic">
            Sklep stacjonarny | Białobrzegi, ul. Reymonta 38A | Stan na: 1 marca 2026 r.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 max-w-5xl">
          
          {/* 1. DANE FIRMY */}
          <Section 
            icon={<Building2 className="text-blue-600" />} 
            title="1. Kto zarządza tą stroną?"
          >
            <p>Właścicielem serwisu informacyjnego <strong>sklep-urwis.pl</strong> oraz Administratorem Twoich danych jest:</p>
            <div className="mt-4 p-6 bg-white/30 rounded-3xl border border-white/50">
              <p className="font-black text-zinc-900 uppercase italic">Sklep Urwis</p>
              <p>ul. Reymonta 38A, 26-800 Białobrzegi</p>
              <p className="mt-2 text-sm font-bold">NIP: 7981093937 | REGON: 671959384</p>
              <p className="text-sm">E-mail: <strong>kontakt@sklep-urwis.pl</strong></p>
            </div>
          </Section>

          {/* 2. CHARAKTER STRONY I ZAKUPY */}
          <Section 
            icon={<ShoppingBag className="text-[#BF2024]" />} 
            title="2. Zakupy i Oferta"
          >
            <p>Ta strona internetowa ma charakter <strong>wyłącznie informacyjny</strong> i prezentuje ofertę produktów dostępnych stacjonarnie.</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Strona nie jest sklepem internetowym – nie umożliwia zawierania umów sprzedaży na odległość.</li>
              <li>Wszelkie transakcje kupna-sprzedaży odbywają się fizycznie w naszym punkcie: <strong>Białobrzegi, ul. Reymonta 38A</strong>.</li>
              <li>Dokładamy starań, aby zdjęcia w galerii odzwierciedlały stan faktyczny, jednak dostępność produktów może się zmieniać dynamicznie.</li>
            </ul>
          </Section>

          {/* 3. PROGRAM LOJALNOŚCIOWY */}
          <Section 
            icon={<Coins className="text-amber-500" />} 
            title="3. Program „Złote Urwisy”"
          >
            <p>Nagradzamy Twoje zakupy stacjonarne punktami, które wymienisz na zabawę:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>10 zł wydane w Sklepie Urwis na Reymonta 38A = 1 Złoty Urwis.</strong></li>
              <li>Złote Urwisy wymienisz w Sali Zabaw <strong>Lecę w Kulki</strong> (ul. Targowicka 4) na wejściówki, kawę lub żetony.</li>
              <li>1 Złoty Urwis ma wartość 1 zł rabatu. Złote Urwisy nie są wymienialne na gotówkę.</li>
            </ul>
          </Section>

          {/* 4. REKLAMACJE (STACJONARNE) */}
          <Section 
            icon={<Scale className="text-blue-600" />} 
            title="4. Reklamacje i Rękojmia"
          >
            <p>Jako rzetelny sklep stacjonarny odpowiadamy za wady towaru zgodnie z przepisami Kodeksu Cywilnego (rękojmia):</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Reklamację zgłosisz najszybciej osobiście w sklepie z dowodem zakupu (paragonem).</li>
              <li>Możesz również napisać do nas na: <strong>kontakt@sklep-urwis.pl</strong>.</li>
              <li>Rozpatrzymy Twoje zgłoszenie w terminie 14 dni.</li>
            </ul>
          </Section>

          {/* 5. PLIKI COOKIES (GODO-FRIENDLY) */}
          <Section 
            icon={<Cookie className="text-blue-600" />} 
            title="5. Pliki Cookies i Prywatność"
          >
            <p>Strona używa <strong>plików cookies</strong>, aby działać szybko i sprawnie:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Niezbędne:</strong> Pozwalają na wyświetlenie animacji i działanie menu.</li>
              <li><strong>Funkcjonalne:</strong> Zapamiętują Twoją listę życzeń (serduszka w galerii) w pamięci Twojej przeglądarki.</li>
              <li><strong>Analityczne:</strong> Anonimowe statystyki (Google Analytics) — włączane <strong>wyłącznie po Twojej zgodzie</strong>. Jeśli odrzucisz cookies, Google Analytics nie zbiera żadnych danych.</li>
            </ul>
            <p className="mt-4">
              Szczegółowe informacje znajdziesz w naszej{' '}
              <Link href="/polityka-prywatnosci" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-bold">
                Polityce Prywatności
              </Link>.
            </p>
          </Section>

          {/* 6. TWOJE PRAWA (RODO) - PANCERNE */}
          <Section 
            icon={<Lock className="text-blue-600" />} 
            title="6. Twoje Prawa (RODO)"
          >
            <p>Dbamy o Twoje dane. Przysługuje Ci:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Prawo do wglądu, poprawienia lub usunięcia danych.</li>
              <li>Prawo do <strong>cofnięcia zgody</strong> na przetwarzanie w dowolnym momencie.</li>
              <li>Prawo do <strong>przenoszenia danych</strong>.</li>
              <li>Prawo do skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</li>
            </ul>
            <p className="mt-4">
              Pełna treść polityki przetwarzania danych:{' '}
              <Link href="/polityka-prywatnosci" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-bold">
                Polityka Prywatności
              </Link>
            </p>
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
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
          {icon}
        </div>
        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none">{title}</h2>
      </div>
      <div className="text-zinc-700 font-medium leading-relaxed text-lg">
        {children}
      </div>
    </motion.section>
  )
}