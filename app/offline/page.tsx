'use client'

import { WifiOff, Home, RefreshCw } from "lucide-react"
import 'next/image'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Ikona i Grafika */}
          <div className="absolute -top-4 -right-4 p-4 bg-red-500 text-white rounded-full shadow-xl">
            <WifiOff size={32} />
          </div>

        {/* Tekst */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Zasięg zwiał <br />
            <span className="text-blue-600">na wagary!</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest leading-relaxed">
            Wygląda na to, że Twój internet potrzebuje chwili przerwy. 
            Nie martw się, Sklep Urwis czeka na Ciebie stacjonarnie!
          </p>
        </div>

        {/* Przyciski sterujące */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
          >
            <RefreshCw size={18} /> Spróbuj połączyć ponownie
          </button>
          
          <a 
            href="/"
            className="w-full py-5 bg-white border-2 border-zinc-100 text-zinc-400 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:text-zinc-900 transition-all"
          >
            <Home size={18} /> Wróć do ekranu startowego
          </a>
        </div>

        <p className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.3em]">
          Sklep Urwis • Białobrzegi
        </p>
      </div>
    </main>
  )
}