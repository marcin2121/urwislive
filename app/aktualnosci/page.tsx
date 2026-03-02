'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pin, Calendar, ChevronRight, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { NEWS_DATA, CATEGORY_STYLES, type NewsItem } from '@/lib/news-data';

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

  const sorted = [...NEWS_DATA].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filtered = filter === 'wszystkie'
    ? sorted
    : sorted.filter((n) => n.category === filter);

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">

        {/* Nawigacja */}
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
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#BF2024] to-[#0055ff] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Newspaper size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase italic leading-[0.9] pr-2">
                Aktualności
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-tight italic text-sm mt-2">
                Co nowego w Sklepie Urwis?
              </p>
            </div>
          </motion.div>
        </header>

        {/* Filtry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-zinc-900 text-white shadow-lg'
                  : 'bg-white/50 border border-white/60 text-zinc-600 hover:bg-white/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Lista aktualności */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-400 font-bold uppercase text-sm italic col-span-2 text-center py-16"
            >
              Brak aktualności w tej kategorii.
            </motion.p>
          )}
        </div>
      </div>
    </main>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const style = CATEGORY_STYLES[item.category];
  const Icon = item.icon;

  const content = (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={`group bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-7 shadow-xl hover:shadow-2xl hover:bg-white/60 transition-all relative overflow-hidden ${
        item.link ? 'cursor-pointer' : ''
      }`}
    >
      {/* Przypięte */}
      {item.pinned && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-amber-500">
          <Pin size={14} className="fill-current" />
          <span className="text-[9px] font-black uppercase tracking-widest">Przypięte</span>
        </div>
      )}

      {/* Kategoria + data */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
          {item.category}
        </span>
        <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
          <Calendar size={10} /> {formatDate(item.date)}
        </span>
      </div>

      {/* Ikona + treść */}
      <div className="flex gap-5">
        <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center shrink-0 shadow-inner`}>
          <Icon size={24} className={style.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-zinc-900 uppercase italic tracking-tighter leading-tight mb-2 group-hover:text-[#0055ff] transition-colors">
            {item.title}
          </h2>
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Link */}
      {item.link && (
        <div className="mt-4 flex justify-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-[#0055ff] transition-colors flex items-center gap-1">
            Czytaj więcej <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      )}
    </motion.article>
  );

  if (item.link) {
    return <Link href={item.link} className="block">{content}</Link>;
  }
  return content;
}
