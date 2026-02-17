'use client'

import { motion } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Zap, CircleDollarSign, Target } from 'lucide-react'

// --- KONFIGURACJA SYSTEMU ---
const EXP_PER_LEVEL = 1000; // Bazowa trudność

/**
 * Funkcja obliczająca dane poziomu na podstawie całkowitego EXP
 */
const getLevelData = (totalExp: number) => {
  // Przykład liniowy (1000 pkt na lvl) - najprostszy do zrozumienia dla dzieci
  const level = Math.floor(totalExp / EXP_PER_LEVEL) + 1;
  const expInCurrentLevel = totalExp % EXP_PER_LEVEL;
  const progressPercent = (expInCurrentLevel / EXP_PER_LEVEL) * 100;
  const expToNext = EXP_PER_LEVEL - expInCurrentLevel;

  return { level, expInCurrentLevel, progressPercent, expToNext };
};

export default function StatsBar() {
  const { profile, session, loading } = useSupabaseAuth()

  if (loading || !session || !profile) return null

  const { level, expInCurrentLevel, progressPercent, expToNext } = getLevelData(profile.exp ?? 0);

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-24 right-4 md:right-8 z-49 pointer-events-none"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-5 min-w-[220px] pointer-events-auto">
        
       {/* NAGŁÓWEK: NICK + LEVEL BADGE */}
<div className="flex items-center justify-between gap-3 mb-3">
  {/* Kontener Nicku - min-w-0 jest kluczowe dla działania truncate w flexie */}
  <div className="flex flex-col min-w-0 flex-1">
    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">
      Agent Urwis
    </span>
    <span className="text-sm font-black text-zinc-900 uppercase italic tracking-tight truncate block">
      {profile.username}
    </span>
  </div>

  {/* Kontener Levelu - flex-shrink-0 gwarantuje, że badge nigdy się nie zmniejszy */}
  <div className="shrink-0">
    <div className="bg-zinc-900 text-white px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/10">
      <span className="text-[10px] font-black text-yellow-400 uppercase">LVL</span>
      <span className="text-sm font-black italic">{level}</span>
    </div>
  </div>
</div>

        {/* PASEK POSTĘPU (POGRUBIONY I CZYTELNY) */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between items-center px-1">
             <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1">
                <Target size={10} /> Progres
             </span>
             <span className="text-[9px] font-black text-zinc-500">{expInCurrentLevel} / {EXP_PER_LEVEL}</span>
          </div>
          
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-50 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="h-full bg-linear-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full relative"
            >
                {/* Efekt "połysku" na pasku */}
                <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* WALUTY (W RZĘDZIE) */}
        <div className="grid grid-cols-3 gap-2 border-t border-zinc-50 pt-4">
          
          {/* URWISKI */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                <CircleDollarSign size={14} fill="currentColor" className="opacity-20" />
                <CircleDollarSign size={14} className="absolute" />
            </div>
            <span className="text-xs font-black text-zinc-900 tracking-tighter">{profile.urwiski ?? 0}</span>
          </div>

{/* KULECZKI */}
<div className="flex flex-col items-center gap-1">
  <motion.div 
    id="kuleczka-target"
    key={profile.kuleczki} // To wyzwala animację przy każdej zmianie wartości
    initial={{ scale: 1 }}
    animate={{ scale: [1, 1.2, 1] }} // Efekt "puknięcia"
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 shadow-sm"
  >
    <div className="w-3.5 h-3.5 bg-blue-500 rounded-full shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.5)]" />
  </motion.div>
  <span className="text-xs font-black text-zinc-900 tracking-tighter">
    {profile.kuleczki ?? 0}
  </span>
</div>

          {/* EXP (Łączny) */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500 border border-yellow-100 shadow-sm">
                <Zap size={14} fill="currentColor" />
            </div>
            <span className="text-xs font-black text-zinc-900 tracking-tighter">{profile.exp ?? 0}</span>
          </div>

        </div>
      </div>
    </motion.div>
  )
}