'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { useSupabaseLoyalty } from '@/contexts/SupabaseLoyaltyContext'
import { Target, Zap, CheckCircle2, Clock, Gift } from 'lucide-react'

export default function MissionTrackerList() {
  const { profile, supabase } = useSupabaseAuth()
  const { addPoints, addExp } = useSupabaseLoyalty()
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMissions = async () => {
    const { data } = await supabase.from('missions').select('*').eq('is_active', true)
    if (data) setMissions(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMissions()
    
    // Nasłuchiwanie na zmiany postępu (wysyłane przez inne części strony)
    const handleProgress = () => fetchMissions();
    window.addEventListener('missionProgress', handleProgress);
    return () => window.removeEventListener('missionProgress', handleProgress);
  }, [])

  const getProgress = (type: string) => {
    if (typeof window === 'undefined' || !profile) return 0
    const today = new Date().toDateString()
    const data = JSON.parse(localStorage.getItem(`urwis_tracking_${profile.id}_${today}`) || '{}')
    
    switch(type) {
      case 'pages_visited': return data.pages_visited || 0
      case 'time_spent': return Math.floor((data.time_spent || 0) / 60)
      case 'games_played': return data.games_played || 0
      default: return 0
    }
  }

  const handleClaim = async (mission: any) => {
    const today = new Date().toDateString()
    const claimKey = `urwis_claimed_${mission.id}_${profile?.id}_${today}`
    
    if (localStorage.getItem(claimKey)) return

    await addPoints(mission.points_reward, `Misja: ${mission.title}`)
    await addExp(mission.exp_reward, `Misja: ${mission.title}`)
    
    localStorage.setItem(claimKey, 'true')
    fetchMissions() // Odśwież widok
  }

  if (loading) return <div className="p-12 text-center animate-pulse font-black text-zinc-300">Wczytywanie listy...</div>

  return (
    <div className="grid grid-cols-1 gap-4">
      {missions.map((mission) => {
        const currentProgress = getProgress(mission.requirement_type)
        const today = new Date().toDateString()
        const isClaimed = typeof window !== 'undefined' && !!localStorage.getItem(`urwis_claimed_${mission.id}_${profile?.id}_${today}`)
        const isCompleted = currentProgress >= mission.requirement_value
        const progressPercent = Math.min(100, (currentProgress / mission.requirement_value) * 100)

        return (
          <motion.div 
            key={mission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row items-center gap-6 
              ${isClaimed ? 'border-green-100 bg-green-50/10 opacity-70' : isCompleted ? 'border-blue-200 bg-blue-50/20' : 'border-zinc-50'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 
              ${isClaimed ? 'bg-green-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
              {isClaimed ? <CheckCircle2 size={32} /> : <Zap size={32} />}
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-black text-xl text-zinc-900">{mission.title}</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100">+{mission.points_reward} PKT</span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black border border-orange-100">+{mission.exp_reward} XP</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 px-1">
                  <span>Postęp: {currentProgress} / {mission.requirement_value}</span>
                  <span>{Math.floor(progressPercent)}%</span>
                </div>
                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-full transition-all duration-1000 ${isClaimed ? 'bg-green-500' : 'bg-blue-600'}`}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {isClaimed ? (
                <div className="text-center font-black text-[10px] uppercase text-green-600 bg-green-100 px-6 py-3 rounded-xl">Nagroda Odebrana</div>
              ) : isCompleted ? (
                <button 
                  onClick={() => handleClaim(mission)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-zinc-900 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  Odbierz Nagrodę <Gift size={14} />
                </button>
              ) : (
                <div className="text-center font-black text-[10px] uppercase text-zinc-400 bg-zinc-100 px-6 py-3 rounded-xl flex items-center justify-center gap-2">
                  W trakcie... <Clock size={14} />
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}