"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, MoveLeft, Sparkles, Smile, Paintbrush, Target, ArrowRight, CircleDot, Blocks, Factory, HelpCircle, Brain, XSquare, Flame, Lightbulb, Gamepad2 } from 'lucide-react';
import MagicBento from '@/components/ui/MagicBento';

// Definicje gier podzielone na kategorie - WERSJA PREMIUM (jak reszta sklepu)


const CATEGORIES = [
  {
    title: 'Kreatywność & Odkrywanie',
    icon: <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />,
    games: [
      { id: 'urwisek', icon: <Smile className="text-yellow-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Wirtualny Urwis', desc: 'Nakarm i baw się ze swoim wirtualnym podopiecznym. Zdobywaj punkty!', glowColor: '250, 204, 21', href: '/strefa-zabawy/urwisek', highlight: true, highlightTag: 'Hit!' },
      { id: 'kolorowanki', icon: <Paintbrush className="text-blue-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Kolorowanki', desc: 'Pomaluj moje ekscytujące przygody i świat pełen kolorów.', glowColor: '59, 130, 246', href: '/strefa-zabawy/kolorowanki' },
      { id: 'urwisar', icon: <Target className="text-red-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Urwis AR', desc: 'Wyskoczę prosto na Twój dywan przez kamerę Twojego urządzenia!', glowColor: '239, 68, 68', href: '/strefa-zabawy/urwisar' },
      { id: 'quiz', icon: <HelpCircle className="text-amber-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Quiz Urwisa', desc: 'Rozwiąż wesoły quiz i przekonaj się, jakim rodzajem Urwisa jesteś.', glowColor: '245, 158, 11', href: '/strefa-zabawy/quiz-urwisa', highlight: true, highlightTag: 'Nowość!' },
    ]
  },
  {
    title: 'Rozrywka & Zręczność',
    icon: <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />,
    games: [
      { id: 'kulki', icon: <CircleDot className="text-cyan-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Kulki', desc: 'Połącz trzy takie same bąbelki, by pękły! Dasz radę odeprzeć atak?', glowColor: '6, 182, 212', href: '/strefa-zabawy/lece-w-kulki', highlight: true, highlightTag: 'Popularne' },
      { id: 'breaker', icon: <Blocks className="text-indigo-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Urwis Breaker', desc: 'Rozbij wszystkie klocki piłką, łap power-upy i bij rekordy!', glowColor: '99, 102, 241', href: '/strefa-zabawy/urwis-breaker' },
      { id: 'fabryka', icon: <Factory className="text-emerald-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Fabryka Urwisa', desc: 'Buduj ogromną fabrykę! Zobacz, jak rośnie Twoje imperium (Idle).', glowColor: '16, 185, 129', href: '/strefa-zabawy/fabryka-urwisa' },
    ]
  },
  {
    title: 'Logika & Pamięć',
    icon: <Brain className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />,
    games: [
      { id: 'memory', icon: <Brain className="text-purple-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Pamięć Urwisa', desc: 'Rozruszaj szare komórki! Szukaj moich ulubionych rzeczy w parach.', glowColor: '168, 85, 247', href: '/strefa-zabawy/memory' },
      { id: 'tictactoe', icon: <XSquare className="text-pink-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Kółko i Krzyżyk', desc: 'Zagrajmy w Kółko i Krzyżyk! Zobaczymy, czy uda Ci się mnie pokonać.', glowColor: '236, 72, 153', href: '/strefa-zabawy/kolko-i-krzyzyk' },
      { id: 'klocki', icon: <Blocks className="text-amber-500 w-8 h-8 md:w-10 md:h-10" />, title: 'Klocki Urwisa', desc: 'Układaj klocki na planszy 9×9! Czyść linie i kwadraty, by zdobywać punkty.', glowColor: '245, 158, 11', href: '/strefa-zabawy/klocki', highlight: true, highlightTag: 'Nowość!' },
    ]
  }
];

export default function StrefaZabawyPage() {
  const trackPlayZoneEvent = (gameId: string, gameTitle: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      setTimeout(() => {
        (window as any).gtag('event', 'strefa_zabawy_gra_klikniecie', {
          'event_category': 'Play_Zone',
          'event_label': gameTitle,
          'game_id': gameId
        });
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 md:pt-[120px] pb-24 md:pb-32 relative z-10 text-zinc-900 overflow-x-hidden">
        
       {/* Nagłówek Huba */}
       <div className="container mx-auto px-4 md:px-6 mb-10 md:mb-16 relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Wróć do sklepu
        </Link>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 text-center md:text-left">
          <img src="/urwis-icon.webp" alt="Superbohater Urwis" className="w-24 h-24 md:w-48 md:h-48 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] animate-bounce-slow object-contain shrink-0" />
          <div className="flex-1">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-zinc-900 mb-4 md:mb-6">
              Strefa <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 pr-2">Zabawy</span>
              <Sparkles className="inline-block text-orange-500 ml-2 md:ml-3 mb-1 md:mb-2 w-8 h-8 md:w-10 md:h-10" />
            </h1>
            
            <p className="text-sm md:text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
              Witaj w centrum wirtualnej rozrywki Sklepu Urwis! Wybierz grę i zagraj za darmo prosto w przeglądarce.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">        
        {/* Kategorie gier */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
          {CATEGORIES.map((category, catIdx) => (
            <div key={catIdx} className="flex flex-col gap-4 md:gap-6">
              
              {/* Nagłówek kategorii */}
              <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4 border-b border-zinc-200">
                {category.icon}
                <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-zinc-400">{category.title}</h2>
              </div>

              {/* Gry w kategorii */}
              <div className="flex flex-col gap-3 md:gap-4">
                {category.games.map((game, i) => (
                  <Link key={game.id} href={game.href} onClick={() => trackPlayZoneEvent(game.id, game.title)} className="block group outline-none h-full">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full"
                    >
                      <MagicBento
                        className={`bg-white/60 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm transition-all h-full flex flex-col relative overflow-hidden ${
                          game.highlight 
                            ? 'border-2 border-[rgba(var(--glow-color),0.4)] hover:shadow-[0_0_30px_rgba(var(--glow-color),0.3)] hover:-translate-y-1 md:hover:-translate-y-2' 
                            : 'border border-white hover:shadow-xl hover:-translate-y-1'
                        }`}
                        glowColor={game.glowColor}
                        enableTilt={false}
                        spotlightRadius={game.highlight ? 400 : 250}
                        disableAnimations={!game.highlight}
                      >
                        {/* Wyróżniony Background Glow */}
                        {game.highlight && (
                           <div className="absolute top-0 right-0 p-16 md:p-20 rounded-full blur-[40px] md:blur-[60px] opacity-10 pointer-events-none transition-all group-hover:opacity-30" style={{ backgroundColor: `rgb(${game.glowColor})` }} />
                        )}

                        <div className="flex items-center md:items-start gap-4 relative z-10 flex-1">
                          <div className={`shrink-0 bg-white ${game.highlight ? 'shadow-md border-[rgba(var(--glow-color),0.2)]' : 'shadow-sm border-zinc-100'} border p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform`}>
                            {game.icon}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center md:justify-start h-full relative">
                            {game.highlight && (
                               <div className="absolute -top-1 md:-top-3 right-0 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-white shadow-sm" style={{ backgroundColor: `rgb(${game.glowColor})` }}>
                                 {game.highlightTag}
                               </div>
                            )}
                            
                            <h3 className={`text-lg md:text-xl font-black uppercase italic tracking-tight mb-0.5 md:mb-2 transition-colors pr-16 md:pr-0 ${game.highlight ? 'text-zinc-900' : 'text-zinc-900 group-hover:text-zinc-600'}`}>
                              {game.title}
                            </h3>
                            <p className="text-zinc-500 font-medium text-[11px] md:text-xs leading-snug md:leading-relaxed flex-1 md:mt-0 line-clamp-2 md:line-clamp-none">
                              {game.desc}
                            </p>
                            <div className="mt-2 md:mt-4 hidden md:flex items-center text-zinc-400 group-hover:text-zinc-900 font-black uppercase tracking-widest text-[10px] transition-colors">
                              Uruchom <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </MagicBento>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
