'use client'
import { motion } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Zap, Coins, Circle, Target, Trophy } from 'lucide-react'

// Definiujemy rozszerzony typ profilu, aby TS nie zgłaszał błędów
interface UrwisProfile {
  username?: string;
  avatar_url?: string;
  level?: number;
  exp?: number;
  urwiski?: number;
  kuleczki?: number;
  role?: string;
}

export default function UserStats() {
  // Rzutujemy profil na nasz nowy typ UrwisProfile
  const { profile } = useSupabaseAuth()
  const p = profile as UrwisProfile;

  if (!p) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto p-4">
      
      {/* KARTA: EXP & LEVEL */}
      <StatCard 
        title="Twój Poziom"
        value={`LVL ${p.level || 1}`}
        sub={`${p.exp || 0} EXP`}
        icon={<Zap className="text-yellow-400 fill-yellow-400" size={20} />}
        color="from-yellow-500 to-orange-500"
        progress={((p.exp || 0) % 1000) / 10} 
      />

      {/* KARTA: URWISKI (PREMIUM) */}
      <StatCard 
        title="URWISKI"
        value={p.urwiski || 0}
        sub="Monety ze sklepu"
        icon={<Circle className="text-red-500 fill-red-500" size={20} />}
        color="from-red-500 to-[#BF2024]"
      />

      {/* KARTA: KULECZKI (WIRTUALNE) */}
      <StatCard 
        title="KULECZKI"
        value={p.kuleczki || 0}
        sub="Zabawa na stronie"
        icon={<div className="w-5 h-5 bg-blue-500 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3)]" />}
        color="from-blue-400 to-blue-600"
      />
    </div>
  )
}

function StatCard({ title, value, sub, icon, color, progress }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-white rounded-4xl p-6 shadow-xl border border-zinc-100"
    >
      {/* Dekoracyjny gradient w tle karty */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${color} opacity-10 rounded-bl-[5rem] -mr-8 -mt-8`} />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-zinc-50 rounded-xl">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
      </div>

      <div className="relative z-10">
        <div className="text-3xl font-black text-zinc-900 tracking-tight">{value}</div>
        <div className="text-xs font-bold text-zinc-500">{sub}</div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full bg-linear-to-r ${color}`}
          />
        </div>
      )}
    </motion.div>
  )
}