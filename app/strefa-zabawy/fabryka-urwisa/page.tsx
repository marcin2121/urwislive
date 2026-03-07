import type { Metadata } from 'next'
import UrwisSwarm from '@/components/urwisek/games/UrwisSwarm'

export const metadata: Metadata = {
  title: 'Fabryka Urwisa - Incremental Game',
  description: 'Zarządzaj potężną fabryką Klocków LEGO. Przeżyj niekończący się wzrost w klasycznym stylu gier idle/clicker!',
}

export default function UrwisSwarmPage() {
  return (
    <div className="relative min-h-[100dvh] bg-zinc-950 text-emerald-500">
       <UrwisSwarm />
    </div>
  )
}
