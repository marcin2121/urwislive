'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Gift, CheckCircle2 } from 'lucide-react'
import { useSupabaseLoyalty } from '@/contexts/SupabaseLoyaltyContext'

export default function DailyRewardBoard() {
  const { addPoints, addExp } = useSupabaseLoyalty()
  const [claimed, setClaimed] = useState(false) // Tu w przyszłości fetch z bazy

  const handleClaim = async () => {
    if (claimed) return
    // Wykorzystujemy RPC z SupabaseLoyaltyContext
    await addPoints(20, 'Codzienne logowanie')
    await addExp(50, 'Bonus za aktywność')
    setClaimed(true)
    
    // Wysyłamy event do NotificationContext
    window.dispatchEvent(new CustomEvent('missionProgress', {
      detail: { type: 'daily_login', value: 1 }
    }))
  }

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-100 flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 bg-zinc-50 rounded-4xl flex items-center justify-center text-4xl shadow-inner">📅</div>
      <div>
        <h3 className="text-2xl font-black text-zinc-900">Codzienny Prezent</h3>
        <p className="text-zinc-500 font-medium">Odbierz darmowe punkty za wizytę!</p>
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed}
        className={`w-full py-5 rounded-4xl font-black uppercase tracking-widest text-xs transition-all shadow-lg
          ${claimed ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white hover:bg-zinc-900 shadow-blue-100'}`}
      >
        {claimed ? (
          <span className="flex items-center justify-center gap-2">Odebrano <CheckCircle2 size={16} /></span>
        ) : (
          <span className="flex items-center justify-center gap-2">Odbierz 20 pkt <Gift size={16} /></span>
        )}
      </button>
    </div>
  )
}