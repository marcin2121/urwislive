'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Cookie, Lock, ArrowLeft,
  Database, Eye, Trash2, Send, Server, Smartphone
} from 'lucide-react'
import Link from 'next/link'

export default function PolitykaPrywatnosciPage() {
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
            className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tighter uppercase italic leading-[0.9]"
          >
            Polityka <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">Prywatności</span>
          </motion.h1>
          <p className="text-zinc-500 font-bold uppercase tracking-tight italic">
            Sklep Urwis | Białobrzegi, ul. Reymonta 38A | Aktualizacja: 1 marca 2026 r.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 max-w-5xl">

          {/* 1. ADMINISTRATOR */}
          <Section
            icon={<ShieldCheck className="text-blue-600" />}
            title="1. Administrator Danych"
          >
            <p>Administratorem Twoich danych osobowych jest:</p>
            <div className="mt-4 p-6 bg-white/30 rounded-3xl border border-white/50">
              <p className="font-black text-zinc-900 uppercase italic">Sklep Urwis - Krzysztof Kawecki</p>
              <p>ul. Reymonta 38A, 26-800 Białobrzegi</p>
              <p className="mt-2 text-sm font-bold">NIP: 7981093937 | REGON: 671959384</p>
              <p className="text-sm">Kontakt w sprawie danych: <strong>kontakt@sklep-urwis.pl</strong></p>
            </div>
          </Section>

          {/* 2. JAKIE DANE ZBIERAMY */}
          <Section
            icon={<Database className="text-blue-600" />}
            title="2. Jakie dane zbieramy?"
          >
            <p>Zbieramy tylko dane niezbędne do działania naszych usług:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Konto użytkownika (opcjonalne):</strong> imię, nazwisko, adres e-mail, numer telefonu — podajesz je dobrowolnie przy rejestracji.</li>
              <li><strong>Powiadomienia Push (opcjonalne):</strong> identyfikator subskrypcji (endpoint) — zapisywany po Twojej zgodzie, by wysyłać Ci powiadomienia o promocjach.</li>
              <li><strong>Dane analityczne:</strong> anonimowe statystyki odwiedzin (Google Analytics) — zbierane tylko po zaakceptowaniu cookies.</li>
              <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny — zbierane automatycznie przez serwer w celach bezpieczeństwa.</li>
            </ul>
            <p className="mt-4 text-sm text-zinc-500 italic font-bold">
              Nie zbieramy danych wrażliwych. Nie przetwarzamy danych dzieci bez zgody rodziców.
            </p>
          </Section>

          {/* 3. CEL PRZETWARZANIA */}
          <Section
            icon={<Eye className="text-[#BF2024]" />}
            title="3. W jakim celu przetwarzamy dane?"
          >
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Świadczenie usług:</strong> obsługa konta, Koła Fortuny, kuponów rabatowych i programu Złote Urwisy.</li>
              <li><strong>Komunikacja:</strong> wysyłanie powiadomień push o promocjach i nowościach (wyłącznie za Twoją zgodą).</li>
              <li><strong>Analityka:</strong> anonimowe statystyki odwiedzin pomagają nam ulepszać stronę (Google Analytics — tylko po zaakceptowaniu cookies).</li>
              <li><strong>Bezpieczeństwo:</strong> ochrona przed nadużyciami i zapewnienie stabilności serwisu.</li>
            </ul>
            <p className="mt-4 text-sm italic font-bold text-zinc-500">
              Podstawa prawna: art. 6 ust. 1 lit. a (zgoda), lit. b (realizacja usług), lit. f (prawnie uzasadniony interes) RODO.
            </p>
          </Section>

          {/* 4. COOKIES */}
          <Section
            icon={<Cookie className="text-amber-500" />}
            title="4. Pliki Cookies"
          >
            <p>Nasza strona używa plików cookies (ciasteczek). Oto ich typy:</p>
            <div className="mt-4 space-y-3">
              <CookieRow
                name="Niezbędne"
                desc="Działanie strony, nawigacja, bezpieczeństwo (sesja logowania, CSRF)."
                canDisable={false}
              />
              <CookieRow
                name="Funkcjonalne"
                desc="Zapamiętywanie Twoich preferencji, wybranego motywu, zgody na cookies."
                canDisable={false}
              />
              <CookieRow
                name="Analityczne"
                desc="Google Analytics — anonimowe statystyki odwiedzin (np. popularne podstrony). Włączane tylko po Twojej zgodzie."
                canDisable={true}
              />
            </div>
            <p className="mt-4 text-sm text-zinc-500 font-bold">
              Możesz zmienić ustawienia cookies w dowolnym momencie w ustawieniach przeglądarki lub klikając „Odrzuć zbędne" w naszym banerze cookies.
            </p>
          </Section>

          {/* 5. UDOSTĘPNIANIE */}
          <Section
            icon={<Send className="text-blue-600" />}
            title="5. Komu udostępniamy dane?"
          >
            <p>Twoje dane <strong>nie są sprzedawane</strong> podmiotom trzecim. Korzystamy z:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Supabase</strong> (baza danych i autoryzacja) — serwery w UE.</li>
              <li><strong>Google Analytics</strong> — anonimowe statystyki odwiedzin (tylko po akceptacji cookies).</li>
              <li><strong>Vercel</strong> — hosting strony (serwery w UE/US, zgodność z GDPR potwierdzona umową DPA).</li>
            </ul>
          </Section>

          {/* 6. PRZECHOWYWANIE */}
          <Section
            icon={<Server className="text-zinc-600" />}
            title="6. Jak długo przechowujemy dane?"
          >
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Dane konta:</strong> do momentu usunięcia konta przez użytkownika.</li>
              <li><strong>Subskrypcje push:</strong> do momentu anulowania subskrypcji lub wygaśnięcia tokenu.</li>
              <li><strong>Cookies analityczne:</strong> max. 26 miesięcy (Google Analytics).</li>
              <li><strong>Logi serwera:</strong> max. 30 dni (potem automatycznie usuwane).</li>
            </ul>
          </Section>

          {/* 7. TWOJE PRAWA */}
          <Section
            icon={<Lock className="text-[#BF2024]" />}
            title="7. Twoje prawa (RODO)"
          >
            <p>Masz pełne prawo do:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Dostępu</strong> — możesz sprawdzić, jakie dane o Tobie przechowujemy.</li>
              <li><strong>Sprostowania</strong> — poprawienie błędnych lub nieaktualnych danych.</li>
              <li><strong>Usunięcia</strong> — prawo do bycia zapomnianym (usuniemy Twoje dane na żądanie).</li>
              <li><strong>Ograniczenia przetwarzania</strong> — możesz poprosić o wstrzymanie przetwarzania.</li>
              <li><strong>Przenoszenia danych</strong> — otrzymasz swoje dane w czytelnym formacie.</li>
              <li><strong>Cofnięcia zgody</strong> — w dowolnym momencie, bez wpływu na legalność wcześniejszego przetwarzania.</li>
              <li><strong>Skargi</strong> — możesz złożyć skargę do Prezesa UODO (uodo.gov.pl).</li>
            </ul>
            <p className="mt-4 text-sm font-bold text-zinc-500">
              Aby skorzystać ze swoich praw, napisz do nas: <strong className="text-zinc-900">kontakt@sklep-urwis.pl</strong>
            </p>
          </Section>

          {/* 8. PWA */}
          <Section
            icon={<Smartphone className="text-blue-600" />}
            title="8. Aplikacja PWA"
          >
            <p>Nasza strona działa jako Progressive Web App (PWA) — możesz ją zainstalować na telefonie jak zwykłą aplikację.</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Instalacja PWA jest <strong>w pełni opcjonalna</strong> i nie wymaga rejestracji.</li>
              <li>Powiadomienia push są włączane <strong>wyłącznie na Twoją prośbę</strong> — nigdy nie włączamy ich automatycznie.</li>
              <li>Service Worker cache&apos;uje zasoby (obrazy, dźwięki) lokalnie na Twoim urządzeniu, aby strona działała szybciej. Te dane możesz usunąć w ustawieniach przeglądarki.</li>
            </ul>
          </Section>

          {/* 9. USA I USUNIĘCIE */}
          <Section
            icon={<Trash2 className="text-red-500" />}
            title="9. Usunięcie danych i konta"
          >
            <p>Chcesz usunąć swoje dane? Masz kilka opcji:</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Cookies:</strong> wyczyść w ustawieniach przeglądarki lub kliknij „Odrzuć zbędne" w banerze cookies.</li>
              <li><strong>Powiadomienia push:</strong> wyłącz w ustawieniach przeglądarki lub systemu operacyjnego.</li>
              <li><strong>Konto:</strong> napisz na <strong>kontakt@sklep-urwis.pl</strong> z prośbą o usunięcie — zrobimy to w ciągu 72 godzin.</li>
            </ul>
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
        <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">{title}</h2>
      </div>
      <div className="text-zinc-700 font-medium leading-relaxed text-lg">
        {children}
      </div>
    </motion.section>
  )
}

function CookieRow({ name, desc, canDisable }: { name: string, desc: string, canDisable: boolean }) {
  return (
    <div className={`p-5 rounded-2xl border ${canDisable ? 'border-amber-200 bg-amber-50/50' : 'border-green-200 bg-green-50/50'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-black text-sm uppercase text-zinc-900">{name}</span>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${canDisable ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
          {canDisable ? 'Opcjonalne' : 'Wymagane'}
        </span>
      </div>
      <p className="text-sm text-zinc-600">{desc}</p>
    </div>
  )
}
