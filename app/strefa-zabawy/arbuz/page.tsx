import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import SuikaGame from '@/components/urwisek/games/SuikaGame';

export const metadata: Metadata = {
  title: 'Gra w Arbuza | Suika Game',
  description: 'Upuszczaj owoce i łącz identyczne! Wiśnia, truskawka, arbuz – jak daleko zajdziesz? Gra fizyczna inspirowana japońskim hitem Suika Game.',
};

export default function SuikaPage() {
  return (
    <div className="min-h-screen bg-transparent pt-20 md:pt-[120px] pb-24 md:pb-32 relative z-10 text-zinc-900 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <Link
          href="/strefa-zabawy"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-emerald-600 shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group mb-8 md:mb-12"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Wróć do Centrum Gier
        </Link>

        <SuikaGame />
      </div>
    </div>
  );
}
