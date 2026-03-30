import Arkanoid from '@/components/urwisek/games/Arkanoid'
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"

export default function ArkanoidPage() {
  return (
    <div className="min-h-screen bg-[#11121b] pt-24 pb-12 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-6 mb-8">
        <Link 
          href="/strefa-zabawy" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-800 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Strefy Zabawy
        </Link>
      </div>
      <div className="w-full max-w-[1200px] px-6">
        <Arkanoid />
      </div>
    </div>
  )
}
