import Link from 'next/link';
import { MoveLeft } from 'lucide-react';
import UrwisARClientWrapper from '@/components/UrwisARClientWrapper';

export const metadata = {
  title: 'Rozszerzona Rzeczywistość - Urwis AR | Sklep Urwis',
  description: 'Zeskanuj znaczniki w naszym sklepie i przenieś się do rozszerzonej rzeczywistości z UrwisAR!',
};

export default function UrwisARPage() {
  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 relative z-10">
      <div className="container mx-auto px-6 mb-8">
        <Link href="/strefa-zabawy" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold uppercase tracking-widest text-xs">
          <MoveLeft size={16} /> Wróć do Strefy Zabawy
        </Link>
      </div>

      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-zinc-900 mb-8 pr-8 pb-2 leading-tight">
          Urwis w <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">AR</span>
        </h1>
        <div className="bg-white rounded-[3rem] p-6 shadow-xl border border-zinc-100 relative overflow-hidden">
          <UrwisARClientWrapper />
        </div>
      </div>
    </div>
  );
}
