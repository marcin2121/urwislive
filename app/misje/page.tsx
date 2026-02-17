'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { useSupabaseLoyalty } from '@/contexts/SupabaseLoyaltyContext'
import Navbar from '@/components/ui/Navbar'
import { 
  Target, Trophy, Star, Flame, Lock, 
  ArrowRight, UserPlus, Zap, Calendar, Gamepad2
} from 'lucide-react'
import Link from 'next/link'

// Nowe komponenty (stworzymy je za chwilę)
import DailyRewardBoard from '@/components/missions/DailyRewardBoard'
import DailyTaskZone from '@/components/missions/DailyTaskZone'
import MissionTrackerList from '@/components/missions/MissionTrackerList'

export default function MisjePage() {
  const { profile, session, loading: authLoading } = useSupabaseAuth()
  const { points, level, totalExp } = useSupabaseLoyalty()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // 🛡️ Strażnik Hydracji i Autoryzacji
  if (!mounted || (authLoading && !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] font-black text-zinc-300 uppercase tracking-widest text-xs">
        Łączenie z centrum dowodzenia...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-20 font-body">
      <Navbar />
      
      {/* MODAL DLA NIEZALOGOWANYCH URWISÓW */}
      <AnimatePresence>
        {!session && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-md bg-white/20"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-zinc-100 max-w-lg w-full text-center space-y-8"
            >
              <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-xl shadow-orange-100">
                <Target size={40} />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-zinc-900 leading-tight">Misje zablokowane!</h2>
                <p className="text-zinc-500 font-medium text-lg">Zaloguj się, aby brać udział w wyzwaniach i zdobywać nagrody dla prawdziwych agentów.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="flex-1 py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-lg">Zaloguj się</Link>
                <Link href="/register" className="flex-1 py-5 bg-white border-2 border-zinc-100 text-zinc-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all">Dołącz do klubu</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`container mx-auto px-6 pt-40 space-y-12 transition-all duration-1000 ${!session ? 'blur-md grayscale opacity-80 pointer-events-none' : ''}`}>
        
        {/* DASHBOARD STATYSTYK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Twój Poziom" value={`Lvl ${level}`} sub={`Suma EXP: ${totalExp}`} icon={<Trophy className="text-yellow-500" />} color="yellow" />
          <StatCard label="Dostępne Punkty" value={points} sub="Wydaj je w sklepie!" icon={<Star className="text-blue-500" fill="currentColor" />} color="blue" />
          <StatCard label="Seria Logowania" value="5 dni" sub="Utrzymuj ogień! 🔥" icon={<Flame className="text-orange-500" fill="currentColor" />} color="orange" />
        </div>

        {/* SEKRETY I ZADANIA DNIA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DailyRewardBoard />
          <DailyTaskZone />
        </div>

        {/* LISTA MISJI GŁÓWNYCH */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
              Twoje Wyzwania <Zap className="text-yellow-500 fill-current" size={24} />
            </h2>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white px-4 py-2 rounded-full border border-zinc-100">Aktualizacja: Codziennie 00:00</div>
          </div>
          <MissionTrackerList />
        </div>

      </main>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600'
  }
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-100 flex items-center gap-6">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-inner ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-zinc-900">{value}</p>
        <p className="text-xs font-bold text-zinc-400">{sub}</p>
      </div>
    </motion.div>
  )
}