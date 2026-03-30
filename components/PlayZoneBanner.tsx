"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Smile, Sparkles,  Target, CircleDot,     HelpCircle, ArrowRight } from "lucide-react";
import MagicBento from '@/components/ui/MagicBento';

const TOP_GAMES = [
  {
    icon: <Smile className="text-yellow-500 w-12 h-12 shrink-0" />,
    title: 'Wirtualny Urwis',
    desc: 'Opiekuj się Urwiskiem i zdobywaj nagrody.',
    glowColor: '234, 179, 8',
    href: '/strefa-zabawy/urwisek',
    tag: 'Hit!'
  },
  {
    icon: <HelpCircle className="text-amber-500 w-12 h-12 shrink-0" />,
    title: 'Quiz Urwisa',
    desc: 'Sprawdź jakim rodzajem Urwisa jesteś!',
    glowColor: '245, 158, 11',
    href: '/strefa-zabawy/quiz-urwisa',
    tag: 'Nowość'
  },
  {
    icon: <CircleDot className="text-cyan-500 w-12 h-12 shrink-0" />,
    title: 'Kulki',
    desc: 'Strzelaj bąbelkami i łącz kolory.',
    glowColor: '6, 182, 212',
    href: '/strefa-zabawy/lece-w-kulki',
    tag: 'Popularne'
  },
  {
    icon: <Target className="text-[#BF2024] w-12 h-12 shrink-0" />,
    title: 'Urwis AR',
    desc: 'Przenieś Urwisa do swojego pokoju.',
    glowColor: '191, 32, 36',
    href: '/strefa-zabawy/urwisar',
  },
];

export default function PlayZoneBanner() {
  const trackBannerEvent = (gameTitle: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'play_zone_banner_klikniecie', {
        'event_category': 'Play_Zone_Banner',
        'event_label': gameTitle
      });
    }
  };

  return (
    <div className="group relative bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-16 border-2 border-white shadow-xl overflow-hidden h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 p-32 bg-[#0055ff]/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 p-32 bg-[#BF2024]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* LEWA STRONA — tekst */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-white text-zinc-900 font-black uppercase text-xs tracking-widest mb-6 shadow-sm">
            <Sparkles size={14} className="text-yellow-500" /> Wirtualny Plac Zabaw
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-black uppercase leading-[1.1] mb-6 pr-4">
            Odkryj potężną{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 pr-4">
              Strefę Zabawy
            </span>
          </h2>

          <p className="text-zinc-600 text-lg md:text-xl font-medium mb-8">
            Ponad 9 darmowych gier i aktywności — gra w przeglądarce lub w aplikacji, bez instalacji! Kolorowanki, strzelanie bąbelkami, budowanie imperium i wiele więcej.
          </p>

          <Link
            href="/strefa-zabawy"
            onClick={() => trackBannerEvent('Strefa Zabawy Main')}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_40px_rgba(250,204,21,0.3)] uppercase"
          >
            Wejdź do gry <Smile size={24} />
          </Link>
        </motion.div>

        {/* PRAWA STRONA — MagicBento siatka kart (Top 4) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative"
        >
          {TOP_GAMES.map((game, i) => (
            <Link key={game.title} href={game.href} onClick={() => trackBannerEvent(game.title)} className="outline-none group">
              <MagicBento
                className="h-full rounded-[2rem] bg-white/70 backdrop-blur-md border border-white p-6 shadow-md hover:shadow-2xl transition-all cursor-pointer flex flex-col hover:-translate-y-2 relative overflow-hidden"
                glowColor={game.glowColor}
                enableSpotlight
                enableBorderGlow
                enableStars={false}
                enableTilt={false}
                spotlightRadius={300}
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="flex flex-col gap-4 relative z-10 flex-1"
                >
                  <div className="flex justify-between items-start">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                    {game.tag && (
                      <span className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {game.tag}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 mt-2">
                    <h3 className="text-zinc-900 font-black text-xl uppercase mb-2 group-hover:text-zinc-700 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-4 flex-1">
                      {game.desc}
                    </p>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-800 transition-colors flex items-center">
                      Zagraj <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </MagicBento>
            </Link>
          ))}
          
          {/* Przycisk "Więcej" pod siatką na mobile/widoczny na desktpo */}
          <div className="sm:col-span-2 mt-2 flex justify-center sm:justify-end">
             <Link href="/strefa-zabawy" onClick={() => trackBannerEvent('Zobacz wszystkie')} className="text-sm font-black uppercase tracking-widest text-[#0055ff] hover:text-[#0044cc] transition-colors flex items-center gap-2 group p-2">
                Zobacz wszystkie 9 gier <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
