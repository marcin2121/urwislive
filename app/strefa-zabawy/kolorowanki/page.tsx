import { Metadata } from 'next';
import ClientLobby from '@/components/ClientLobby';
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Darmowe Kolorowanki Online dla Dzieci | Sklep Urwis',
  description: 'Odkryj interaktywne kolorowanki dla dzieci. Maluj online, baw się i pobieraj darmowe obrazki do druku. Idealna kreatywna zabawa edukacyjna w Akademii Urwisa!',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content', // ← dodaj to
};


export default function KolorowankiPage() {
  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 relative z-10">
      <div className="container mx-auto px-6 mb-4 md:mb-8">
        <Link 
          href="/strefa-zabawy" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Strefy Zabawy
        </Link>
      </div>
      
      <div className="w-full md:container md:mx-auto md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 px-6 md:px-0 mb-8">
          <img src="/urwis-icon.webp" alt="Urwis z pędzlem" className="w-24 h-24 hidden md:block drop-shadow-xl animate-bounce-slow" />
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 pr-8 pb-2 leading-tight">
              Pomaluj Mój <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Świat!</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl text-lg mt-2 hidden md:block">
              "Wybierz jeden z przygotowanych przeze mnie obrazków i nadaj mu unikalne kolory korzystając z pędzli! Do dzieła!"
            </p>
          </div>
        </div>
        <div className="bg-white md:rounded-[3rem] md:p-4 shadow-xl border-y md:border border-zinc-100 relative overflow-hidden w-full">
          <ClientLobby />
        </div>
      </div>
    </div>
  );
}
