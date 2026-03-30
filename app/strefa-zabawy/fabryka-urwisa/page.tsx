import type { Metadata } from 'next'
import UrwisSwarm from '@/components/urwisek/games/UrwisSwarm'
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: 'Fabryka Urwisa - Incremental Game',
  description: 'Zarządzaj potężną fabryką Klocków LEGO. Przeżyj niekończący się wzrost w klasycznym stylu gier idle/clicker!',
}

export default function UrwisSwarmPage() {
  return (
    <div className="relative min-h-[100dvh] bg-zinc-950 text-emerald-500 pt-24 pb-12 flex flex-col items-center">
      <div className="w-full max-w-5xl px-6 mb-8">
        <Link 
          href="/strefa-zabawy" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-800 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Strefy Zabawy
        </Link>
      </div>
      <div className="w-full max-w-5xl px-6">
         <UrwisSwarm />
      </div>
    </div>
  )
}
