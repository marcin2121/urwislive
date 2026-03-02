import Link from 'next/link'
import { MoveLeft, RotateCcw, CircleDot } from 'lucide-react'
import BubbleShooter from '@/components/urwisek/games/BubbleShooter'

export const metadata = {
  title: 'Lecę w Kulki | Sklep Urwis',
  description: 'Graj w kultową grę Bubble Shooter i bij rekordy w strefie Urwiska!',
}

export default function BubbleShooterPage() {
  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 relative overflow-hidden flex flex-col items-center">
      {/* Kolorowe tło ambientowe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl px-4 relative z-10 flex-1 flex flex-col">
        {/* Nawigacja powrotna */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/strefa-zabawy" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs bg-white/5 py-2 px-4 rounded-full border border-white/10"
          >
            <MoveLeft size={16} /> Wróć
          </Link>
          <div className="flex items-center gap-2 text-cyan-400 font-black italic uppercase tracking-tighter text-2xl">
            Lecę w Kulki <CircleDot size={20} className="mb-1" />
          </div>
        </div>

        {/* Kontener Gry */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-2 md:p-4 shadow-2xl flex-1 flex flex-col overflow-hidden relative">
           <BubbleShooter />
        </div>
      </div>
    </div>
  )
}
