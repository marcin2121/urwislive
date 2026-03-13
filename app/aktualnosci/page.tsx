'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pin, Calendar, ChevronRight, Newspaper, Sparkles, MoveLeft } from 'lucide-react';
import Link from 'next/link';
import { NEWS_DATA, CATEGORY_STYLES, type NewsItem } from '@/lib/news-data';
import MagicBento from '@/components/ui/MagicBento';

type CategoryFilter = 'wszystkie' | 'nowość' | 'promocja' | 'wydarzenie' | 'informacja';

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'wszystkie', label: 'Wszystkie' },
  { id: 'nowość', label: 'Nowości' },
  { id: 'promocja', label: 'Promocje' },
  { id: 'wydarzenie', label: 'Wydarzenia' },
  { id: 'informacja', label: 'Informacje' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AktualnosciPage() {
  const [filter, setFilter] = useState<CategoryFilter>('wszystkie');

  const trackNewsEvent = (action: string, label: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'aktualnosci_interakcja', {
        'event_category': 'News',
        'event_label': label,
        'interaction_type': action
      });
    }
  };

  const sorted = [...NEWS_DATA].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filtered = filter === 'wszystkie'
    ? sorted
    : sorted.filter((n) => n.category === filter);

  const featuredItem = filtered.length > 0 && filter === 'wszystkie' ? filtered[0] : null;
  const gridItems = featuredItem ? filtered.slice(1) : filtered;

  return (
    <main className="min-h-screen bg-transparent pt-24 md:pt-[120px] pb-32 relative overflow-x-hidden text-zinc-900">
      
      {/* Dekoracyjne Okręgi */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">

        {/* Nawigacja */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 md:mb-12"
        >
          <Link href="/oferta" className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 mb-8 group">
              <MoveLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Powrót do oferty
            </Link>
        </motion.div>

        {/* Header */}
        <header className="mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 text-center md:text-left"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/10 border-2 border-white shrink-0 group hover:scale-105 transition-transform">
              <Newspaper size={48} className="text-blue-500 group-hover:rotate-6 transition-transform" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase leading-tight mb-4">
                Twoje <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF2024] to-[#0055ff]">Aktualności</span>
                <Sparkles className="inline-block text-[#0055ff] ml-3 mb-2 w-10 h-10" />
              </h1>
              <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
                Odkryj najnowsze wieści ze świata Sklepu Urwis! Nowe gry, mega promocje, wydarzenia i zapowiedzi - wszystko zebrane w jednym miejscu.
              </p>
            </div>
          </motion.div>
        </header>

        {/* Filtry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-10 md:mb-16"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { trackNewsEvent('zmiana_kategorii', f.id); setFilter(f.id); }}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all focus:outline-none ${
                filter === f.id
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105'
                  : 'bg-white/60 backdrop-blur-md border border-white text-zinc-600 hover:bg-white hover:text-zinc-900 hover:shadow-md'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Wyróżniony artykuł Top */}
        <AnimatePresence mode="wait">
          {featuredItem && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 md:mb-12"
            >
              <FeaturedNewsCard item={featuredItem} onClick={() => trackNewsEvent('klikniecie_artykulu', featuredItem.title)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista pozostałych aktualności */}
        <motion.div 
           layout 
           className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {gridItems.map((item, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                key={item.id}
              >
                <NewsCard item={item} onClick={() => trackNewsEvent('klikniecie_artykulu', item.title)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
              <Newspaper size={32} className="text-zinc-300" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-zinc-400 mb-2">Pusto tutaj!</h3>
            <p className="text-zinc-500 font-medium">Brak aktualności w tej kategorii. Spróbuj wybrać inną.</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// ----------------------------------------------------
// COMPONENTS
// ----------------------------------------------------

function FeaturedNewsCard({ item, onClick }: { item: NewsItem; onClick?: () => void }) {
  const style = CATEGORY_STYLES[item.category];
  const Icon = item.icon;

  const content = (
    <MagicBento
      className="bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col cursor-pointer"
      glowColor={style.glowColor}
      enableSpotlight
      spotlightRadius={600}
      enableTilt={false}
    >
      <div className="absolute top-0 right-0 p-32 md:p-48 bg-white/40 blur-[100px] rounded-full pointer-events-none group-hover:bg-white/60 transition-colors z-0"></div>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10 w-full h-full">
        {/* Lewa strona - Ikona */}
        <div className="shrink-0 flex justify-center lg:justify-start">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] ${style.bg} flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
            <Icon size={48} className={style.color} />
          </div>
        </div>

        {/* Prawa strona - Tekst */}
        <div className="flex-1 flex flex-col text-center lg:text-left">
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
            {item.pinned && (
              <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm border border-amber-200">
                <Pin size={12} className="fill-current" /> Przypięte
              </span>
            )}
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${style.bg} ${style.color}`}>
              {item.category}
            </span>
            <span className="text-[11px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar size={12} /> {formatDate(item.date)}
            </span>
          </div>

          <h2 className={`text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-[1.1] mb-4 transition-colors ${style.color}`}>
            {item.title}
          </h2>
          
          <p className="text-zinc-600 font-medium text-base md:text-lg leading-relaxed flex-1 mb-8">
            {item.description}
          </p>

          {(item.link || item.category === 'nowość') && (
            <div className={`inline-flex items-center justify-center lg:justify-start gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-md transition-all self-center lg:self-start w-full sm:w-auto ${style.bg} ${style.color} group-hover:brightness-95`}>
              {item.link ? 'Zobacz szczegóły' : 'Czytaj więcej'} <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </MagicBento>
  );

  if (item.link) {
    return <Link href={item.link} onClick={onClick} className="block group outline-none h-full">{content}</Link>;
  }
  return <div className="block group outline-none h-full">{content}</div>;
}


function NewsCard({ item, onClick }: { item: NewsItem; onClick?: () => void }) {
  const style = CATEGORY_STYLES[item.category];
  const Icon = item.icon;

  const content = (
    <MagicBento
      className="bg-white/60 backdrop-blur-md border border-white rounded-[1.5rem] md:rounded-[2rem] p-6 lg:p-8 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full cursor-pointer hover:-translate-y-1"
      glowColor={style.glowColor}
      enableSpotlight
      spotlightRadius={300}
      enableTilt={false}
    >
      <div className="flex flex-col h-full relative z-10">
        
        {/* Nagłówek Karty */}
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${style.bg} flex items-center justify-center shadow-inner border border-white/50 group-hover:scale-110 transition-transform shrink-0`}>
            <Icon size={28} className={style.color} />
          </div>
          
          <div className="flex flex-col items-end gap-2">
             {item.pinned && (
               <span className="text-amber-500 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full">
                 <Pin size={10} className="fill-current" /> Hot
               </span>
             )}
             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
              {item.category}
            </span>
          </div>
        </div>

        {/* Treść */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl md:text-2xl font-black text-zinc-900 uppercase italic tracking-tight leading-snug mb-3 group-hover:text-zinc-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed flex-1 mb-6">
            {item.description}
          </p>
          
          {/* Stopka Karty */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100/50">
             <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 uppercase tracking-wider">
              <Calendar size={12} /> {formatDate(item.date)}
            </span>
            {(item.link || item.category === 'nowość') && (
              <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${style.color}`}>
                Czytaj <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </span>
            )}
          </div>
        </div>
      </div>
    </MagicBento>
  );

  if (item.link) {
    return <Link href={item.link} onClick={onClick} className="block group outline-none h-full">{content}</Link>;
  }
  return <div className="block group outline-none h-full">{content}</div>;
}
