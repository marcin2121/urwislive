'use client'

import { motion } from 'framer-motion'
import { 
  Gamepad2, Zap, ArrowRight, Star, Trophy, 
  User, Palette, Image as ImageIcon, BrainCircuit, Calendar, 
  Sparkles, Lock, MousePointerClick, TrendingUp, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

const URWIS_RED = '#bf2024';
const URWIS_BLUE = '#0055ff';

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      
      {/* --- HERO: ŚWIAT KULECZEK --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-zinc-100 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-[#0055ff] font-black uppercase text-[10px] tracking-widest border border-blue-100 mb-8"
          >
            <Sparkles size={14} className="animate-pulse" /> Wirtualne Centrum Zabawy
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-9xl font-black font-heading italic uppercase tracking-tighter mb-8 leading-[0.8]"
          >
            Graj i <br /> 
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${URWIS_BLUE}, #5eb1ff)` }}>
              Zbieraj
            </span>
          </motion.h1>
          
          <p className="text-zinc-800 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-12 leading-relaxed">
            Witaj w strefie, gdzie Twoja aktywność zamienia się w cyfrowe skarby. 
            Zbieraj Kuleczki, wbijaj poziomy i stwórz najbardziej unikalny profil Urwisa!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-200 text-zinc-800 font-black uppercase text-[10px] tracking-widest">
               <CheckCircle2 size={14} className="text-green-600" /> Darmowa Rejestracja
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-200 text-zinc-800 font-black uppercase text-[10px] tracking-widest">
               <CheckCircle2 size={14} className="text-green-600" /> Codzienne Bonusy
             </div>
          </div>
        </div>
      </section>

      {/* --- SEKCJA 1: KULECZKI - TWOJA WALUTA FUNU --- */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl text-[#0055ff] font-black uppercase text-[10px] tracking-widest border border-blue-100">
                Waluta Wirtualna
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic uppercase text-zinc-900 leading-none tracking-tighter">
                Kuleczki: <br/>
                <span className="text-[#0055ff]">Silnik Twojej Przygody</span>
              </h2>
              <p className="text-zinc-800 font-bold text-lg leading-relaxed">
                Kuleczki to Twoja przepustka do personalizacji i prestiżu w rankingu. Nie kupisz ich za prawdziwe pieniądze – musisz je zdobyć poprzez grę i regularność!
              </p>

              <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 text-white/5"><Gamepad2 size={120} /></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <TrendingUp size={24} />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase text-blue-400 tracking-widest">Droga Urwisa</p>
                          <p className="text-xl font-bold">Graj → Zbieraj → Flexuj</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-amber-400 font-black text-lg">Quizy</p>
                          <p className="text-zinc-200 text-xs font-bold leading-snug">Sprawdzaj wiedzę i zgarniaj nagrody za poprawne odpowiedzi.</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-blue-400 font-black text-lg">Daily Bonus</p>
                          <p className="text-zinc-200 text-xs font-bold leading-snug">Wpadaj codziennie, by odebrać darmowe doładowanie konta.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl shadow-blue-900/5 group hover:border-blue-300 transition-all">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-6">
                    <User size={24} />
                  </div>
                  <h4 className="text-xl font-black uppercase italic mb-3">Nowe Awatary</h4>
                  <p className="text-sm text-zinc-700 font-bold leading-relaxed">
                    Wymień Kuleczki na unikalne portrety do swojego profilu. Pokaż swój styl!
                  </p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl shadow-blue-900/5 group hover:border-blue-300 transition-all">
                  <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-2xl flex items-center justify-center mb-6">
                    <Palette size={24} />
                  </div>
                  <h4 className="text-xl font-black uppercase italic mb-3">Kolory Nicku</h4>
                  <p className="text-sm text-zinc-700 font-bold leading-relaxed">
                    Wyróżnij się w rankingu dzięki neonowym kolorom swojej nazwy użytkownika.
                  </p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl shadow-blue-900/5 group hover:border-blue-300 transition-all">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-6">
                    <Trophy size={24} />
                  </div>
                  <h4 className="text-xl font-black uppercase italic mb-3">Rankingi</h4>
                  <p className="text-sm text-zinc-700 font-bold leading-relaxed">
                    Rywalizuj z innymi o tytuł najbardziej aktywnego Urwisa w Twoim mieście.
                  </p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl shadow-blue-900/5 group hover:border-blue-300 transition-all">
                  <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-6">
                    <ImageIcon size={24} />
                  </div>
                  <h4 className="text-xl font-black uppercase italic mb-3">Tła Profilu</h4>
                  <p className="text-sm text-zinc-700 font-bold leading-relaxed">
                    Zmieniaj wygląd swojej strony profilowej i zbieraj cyfrowe trofea.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEKCJA 2: SYSTEM GIER - DLACZEGO WARTO WRACAĆ? --- */}
      <section className="py-24 px-6 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
              Zostań <span className="text-[#0055ff]">Legendą</span> Urwisów
            </h2>
            <p className="text-zinc-200 font-bold text-lg mt-4 max-w-2xl mx-auto">
              Regularność to Twoja największa broń. Zobacz, co przygotowaliśmy dla najaktywniejszych graczy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* ELEMENT 1: QUIZY */}
             <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] backdrop-blur-xl group hover:border-blue-500/50 transition-all">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <BrainCircuit size={28} />
                </div>
                <h4 className="text-2xl font-black italic uppercase mb-4 text-white">Quizy</h4>
                <p className="text-zinc-100 font-bold text-sm leading-relaxed mb-6">
                  Wiedza to Kuleczki. Codziennie nowe pytania. Każdy poprawny zestaw to szybki zastrzyk wirtualnej gotówki.
                </p>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest">
                   <MousePointerClick size={14} /> Rozwiąż teraz
                </div>
             </div>

             {/* ELEMENT 2: DAILY LOGIN */}
             <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] backdrop-blur-xl group hover:border-yellow-500/50 transition-all">
                <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-600/20 group-hover:scale-110 transition-transform text-zinc-900">
                  <Calendar size={28} />
                </div>
                <h4 className="text-2xl font-black italic uppercase mb-4 text-white">Codzienna Wizyta</h4>
                <p className="text-zinc-100 font-bold text-sm leading-relaxed mb-6">
                  Wbijaj na stronę codziennie! Twój bonus rośnie z każdym kolejnym dniem logowania z rzędu.
                </p>
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-black uppercase tracking-widest">
                   <Star size={14} fill="currentColor" /> Utrzymaj passę
                </div>
             </div>

             {/* ELEMENT 3: LEVEL UP (EXP) */}
             <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] backdrop-blur-xl group hover:border-red-500/50 transition-all">
                <div className="w-14 h-14 bg-[#bf2024] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                  <Zap size={28} fill="currentColor" />
                </div>
                <h4 className="text-2xl font-black italic uppercase mb-4 text-white">Poziom Mocy</h4>
                <p className="text-zinc-100 font-bold text-sm leading-relaxed mb-6">
                  Punkty EXP zdobywasz za wszystko. Wyższy poziom to odblokowane nowe nagrody w Twoim profilu.
                </p>
                <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest">
                   <Lock size={14} /> Unikalne itemy od Lvl 50
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- SEKCJA REJESTRACJI: DOŁĄCZ DO URWISÓW --- */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto bg-zinc-50 rounded-[4rem] p-10 md:p-20 border border-zinc-200 text-center relative overflow-hidden shadow-sm">
           <div className="absolute -top-10 -right-10 text-zinc-100"><Sparkles size={200} /></div>
           
           <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-black italic uppercase mb-6 tracking-tighter text-zinc-900">
                Bez konta ani rusz!
              </h3>
              <p className="text-zinc-800 font-bold text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Tylko zalogowani gracze mogą zapisywać stan posiadania Kuleczek, wbijać Poziomy i kupować przedmioty w sklepie profilowym.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto mb-10">
                 <div className="flex items-center gap-3 font-black text-zinc-700 text-sm">
                    <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                    Zapis postępów w grach
                 </div>
                 <div className="flex items-center gap-3 font-black text-zinc-700 text-sm">
                    <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                    Własny profil Urwisa
                 </div>
                 <div className="flex items-center gap-3 font-black text-zinc-700 text-sm">
                    <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                    Sklep z nagrodami
                 </div>
                 <div className="flex items-center gap-3 font-black text-zinc-700 text-sm">
                    <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                    Rywalizacja w rankingu
                 </div>
              </div>

              <Link href="/login" className="inline-flex items-center gap-3 px-12 py-5 bg-[#0055ff] text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all text-sm">
                Załóż Darmowe Konto <ArrowRight size={18} />
              </Link>
           </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-24 px-6 text-center border-t border-zinc-100">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-zinc-900 mb-10 leading-none">
          Twoja Super Przygoda <br/> <span style={{ color: URWIS_RED }}>zaczyna się teraz!</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/gry" className="w-full sm:w-auto px-12 py-5 bg-[#bf2024] text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 transition-all text-sm">
              Graj w Gry
           </Link>
           <Link href="/quiz" className="w-full sm:w-auto px-12 py-5 bg-white border-2 border-zinc-200 text-zinc-900 rounded-full font-black uppercase tracking-widest hover:bg-zinc-100 transition-all text-sm shadow-md">
              Rozwiąż Quiz
           </Link>
        </div>
      </section>
    </main>
  )
}