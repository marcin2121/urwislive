'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // 🚀 DODANY IMPORT NEXT/IMAGE
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Trophy, Heart, Smartphone, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';
import ColoringZone, { Template } from '@/components/ColoringZone';

const TEMPLATES: Template[] = [
  { id: 'lego', title: 'Zabawki', brand: 'Sklep Urwis', difficulty: 'Normalny', thumb: '/coloring/thumb-lego.webp', src: '/coloring/urwis-lego.webp' },
  { id: 'urwis', title: 'Mój Urwis', brand: 'Superbohater', difficulty: 'Łatwy', thumb: '/coloring/thumb-urwis.webp', src: '/coloring/urwis-urwis.webp' },
  { id: 'kulki', title: 'Sala Lecę w Kulki', brand: 'Białobrzegi', difficulty: 'Łatwy', thumb: '/coloring/thumb-projektor.webp', src: '/coloring/urwis-projektor.webp' },
  { id: 'urodziny', title: 'Przyjęcie Marzeń', brand: 'Lecę w Kulki', difficulty: 'Trudny', thumb: '/coloring/thumb-urodziny.webp', src: '/coloring/urwis-urodziny.webp' },
];

export default function ClientLobby() {
  const [activeGame, setActiveGame] = useState<Template | null>(null);
  
  const [accessStatus, setAccessStatus] = useState<'loading' | 'granted' | 'blocked'>('loading');
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const checkAccess = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|windows phone/i.test(userAgent);
      const isApple = /iphone|ipad|ipod/i.test(userAgent);
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

      setIsIOS(isApple);

      if (!isMobile) setAccessStatus('granted');
      else if (isStandalone) setAccessStatus('granted');
      else setAccessStatus('blocked');
    };
    checkAccess();
  }, []);

  useEffect(() => {
    if (activeGame) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeGame]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  // ------------------------------------
  // EKRAN BLOKADY MOBILNEJ
  // ------------------------------------
  if (accessStatus === 'blocked') {
    return (
      <main className="min-h-screen bg-[#BF2024] flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl max-w-sm w-full text-center relative z-10">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Smartphone size={36} className="text-[#0055ff]" />
          </div>
          
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-tight">
            Zainstaluj <br/> <span className="text-[#0055ff]">Kolorowanki</span>
          </h2>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-8 leading-relaxed">
            Aby malować na telefonie bez przeszkód, dodaj naszą aplikację edukacyjną do ekranu głównego.
          </p>

          <div className="bg-white/5 rounded-3xl p-6 text-left border border-white/5 mb-6">
            {deferredPrompt ? (
              <div className="text-center">
                <button 
                  onClick={handleInstallClick}
                  className="w-full py-5 bg-[#0055ff] hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-sm active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Zainstaluj teraz
                </button>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mt-4 tracking-widest">To zajmie tylko sekundę!</p>
              </div>
            ) : (
              <>
                <h3 className="font-black uppercase text-[11px] tracking-widest text-zinc-500 mb-4">Instrukcja instalacji:</h3>
                {isIOS ? (
                  <ul className="space-y-4 text-sm font-bold text-zinc-300">
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-blue-400 mt-1"><Share size={18} /></div>
                      <p className="leading-tight">Kliknij ikonę <strong className="text-white">Udostępnij</strong> w dolnym menu Safari.</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-white mt-1"><PlusSquare size={18} /></div>
                      <p className="leading-tight">Kliknij zobacz więcej, przewiń menu w dół i wybierz <strong className="text-white">Do ekranu głównego</strong>.</p>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-4 text-sm font-bold text-zinc-300">
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-white mt-1"><MoreVertical size={18} /></div>
                      <p className="leading-tight">Kliknij <strong className="text-white">Trzy kropki</strong> w prawym górnym rogu Chrome.</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-blue-400 mt-1"><Download size={18} /></div>
                      <p className="leading-tight">Wybierz <strong className="text-white">Zainstaluj aplikację</strong>.</p>
                    </li>
                  </ul>
                )}
              </>
            )}
          </div>
          
          <div className="w-full py-4 bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/20 shadow-inner">
             Gotowe? Uruchom aplikację z pulpitu!
          </div>
        </motion.div>
      </main>
    );
  }

  if (accessStatus === 'loading') return <div className="min-h-screen bg-[#FDFDFD]" />;

  // ------------------------------------
  // GŁÓWNY WIDOK LOBBY
  // ------------------------------------
  return (
    <main className="min-h-screen bg-[#FDFDFD] font-sans pb-16">
      
      {/* HEADER Z OPTYMALIZACJĄ H1 POD SEO */}
      <section className="bg-[#BF2024] pt-24 pb-44 px-6 rounded-b-[5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block backdrop-blur-sm">
              Darmowa Zabawa Online • Białobrzegi
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] mb-6 drop-shadow-xl">
              Kolorowanki <br /> <span className="text-[#0055ff]">Dla Dzieci</span>
            </h1>
            <p className="max-w-xl text-lg font-bold uppercase italic opacity-90 leading-tight drop-shadow-md mx-auto md:mx-0">
              Poczuj radość tworzenia w Studio Urwisa! Wybierz malowankę i odkryj magię interaktywnego pędzla. Twoje arcydzieła czekają!
            </p>
          </motion.div>
        </div>
      </section>

      {/* GRID Z GRAMI */}
      <section className="max-w-7xl mx-auto px-6 -mt-24 relative z-20 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEMPLATES.map((game, i) => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              className="bg-white rounded-[3.5rem] p-5 shadow-2xl border border-zinc-100 group hover:shadow-sky-100 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              {/* 🚀 ZOPTYMALIZOWANY OBRAZEK */}
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-6 bg-zinc-100 shrink-0">
  <Image 
    src={game.thumb || ''} // 🚀 Naprawione: dodany fallback dla TypeScripta
    alt={`Kolorowanka online: ${game.title}`} 
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    className="object-cover group-hover:scale-110 transition-transform duration-700 origin-center" 
  />
  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase text-zinc-900 border border-black/5 shadow-sm">
    {game.difficulty}
  </div>
</div>

              <div className="px-2 mb-6 flex-1">
                <h3 className="text-2xl font-black uppercase italic text-zinc-900 leading-none mb-1 tracking-tighter line-clamp-2">{game.title}</h3>
                <span className="text-[10px] font-black text-[#0055ff] uppercase tracking-widest">{game.brand}</span>
              </div>
              <button 
                onClick={() => setActiveGame(game)}
                className="w-full py-5 mt-auto bg-[#BF2024] text-white rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#0055ff] transition-all shadow-lg active:scale-95 shadow-red-500/20"
              >
                <Play size={18} fill="currentColor" /> Graj Teraz
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SEKCJA INFO (BENEFITY) */}
      <section className="relative z-30 max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-16 bg-transparent">
        <div className="text-center group">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 border border-white/50">
            <Sparkles className="text-yellow-500" size={28} />
          </div>
          <h2 className="text-xl font-black uppercase italic text-zinc-900 mb-3 tracking-tighter drop-shadow-sm">
            Edukacyjne Malowanki
          </h2>
          <p className="text-zinc-600 font-bold uppercase text-[11px] leading-relaxed tracking-wider drop-shadow-sm">
            Nasze wirtualne kolorowanki to świetny trening motoryki małej i przygotowanie przedszkolaka do nauki pisania.
          </p>
        </div>
        
        <div className="text-center group">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 relative z-10 border border-white/50">
            <Trophy className="text-[#0055ff]" size={28} />
          </div>
          <h2 className="text-xl font-black uppercase italic text-zinc-900 mb-3 tracking-tighter drop-shadow-sm">
            Gry dla Dzieci
          </h2>
          <p className="text-zinc-600 font-bold uppercase text-[11px] leading-relaxed tracking-wider drop-shadow-sm">
            Zbieraj punkty Akademii Urwisa za każdą ukończoną planszę i wymieniaj je na nagrody w Sklepie.
          </p>
        </div>
        
        <div className="text-center group">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:scale-125 transition-all duration-300 relative z-10 border border-white/50">
            <Heart className="text-[#BF2024]" size={28} />
          </div>
          <h2 className="text-xl font-black uppercase italic text-zinc-900 mb-3 tracking-tighter drop-shadow-sm">
            Dla Całej Rodziny
          </h2>
          <p className="text-zinc-600 font-bold uppercase text-[11px] leading-relaxed tracking-wider drop-shadow-sm">
            Twórzcie, bawcie się i pobierajcie rysunki do druku. Idealny sposób na darmowe, kreatywne popołudnie!
          </p>
        </div>
      </section>

      {/* DYSKRETNY TEKST SEO (Czytany przez Google, mało widoczny dla zwykłego usera) */}
      <section className="max-w-4xl mx-auto px-6 pb-12 text-center opacity-40 hover:opacity-100 transition-opacity">
        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-widest mb-2">Najlepsze kolorowanki do druku i online</h3>
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          Szukasz pomysłu na kreatywną zabawę? W Sklepie Urwis przygotowaliśmy darmowe kolorowanki online dla dziewczynek i chłopców. Znajdziesz tu edukacyjne malowanki z zabawkami, bohaterami i motywami z naszej Sali Zabaw w Białobrzegach. Nasze interaktywne gry dla dzieci rozwijają wyobraźnię i pozwalają na bezpieczną rozrywkę bez instalowania dodatkowych aplikacji. Zapisz gotowy obrazek i stwórz własną galerię sztuki do druku!
        </p>
      </section>

      <AnimatePresence>
        {activeGame && (
          <ColoringZone 
            template={activeGame} 
            onClose={() => setActiveGame(null)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}