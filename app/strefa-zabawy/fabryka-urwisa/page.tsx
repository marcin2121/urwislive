import type { Metadata } from 'next'
import UrwisSwarm from '@/components/urwisek/games/UrwisSwarm'

export const metadata: Metadata = {
  title: 'Fabryka Urwisa - Incremental Game',
  description: 'Zarządzaj potężną fabryką Klocków LEGO. Przeżyj niekończący się wzrost w klasycznym stylu gier idle/clicker!',
}

export default function UrwisSwarmPage() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden overscroll-none touch-none bg-zinc-950 text-emerald-500 z-[9999]" style={{ width: '100vw', height: '100dvh' }}>
       <UrwisSwarm />
    </div>
  )
}
