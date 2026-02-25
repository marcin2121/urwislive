'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

// Importy komponentów modułowych
import StatsSection from './urwisek/StatsSection'
import ActionPanel from './urwisek/ActionPanel'
import PetDisplay from './urwisek/PetDisplay'
import RankingModal from './urwisek/RankingModal'

// Importy logiki i akcji
import { interactWithUrwis, claimDailyLogin, getUrwisRanking } from '@/app/actions/tamagotchi'
import { calculateDecay } from '@/lib/urwis/engine'

export interface PetState {
  playerName: string
  petName: string
  gender: string
  level: number
  hunger: number
  happiness: number
  hygiene: number
  urwisCoins: number
  goldenUrwis: number
  points_earned: number
  lastInteraction: string
}

export default function UrwisekDashboard({ initialState }: { initialState: PetState }) {
  const [state, setState] = useState<PetState>(() => ({
    ...initialState,
    hunger: Number(initialState.hunger) || 0,
    hygiene: Number(initialState.hygiene) || 0,
    happiness: Number(initialState.happiness) || 0,
  }))
  
  const [isPending, startTransition] = useTransition()
  const [activeMode, setActiveMode] = useState<'none' | 'washing' | 'feeding' | 'playing' | 'ranking'>('none')
  const [rewardMessage, setRewardMessage] = useState<string | null>(null)
  const [showSmile, setShowSmile] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{show: boolean, lvl: number} | null>(null)
  const [showLoginBonus, setShowLoginBonus] = useState(false)
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isRankingOpen, setIsRankingOpen] = useState(false)
  
  const lastTickRef = useRef(Date.now());

  // ✅ LOGIKA RANKINGU
  useEffect(() => {
    if (activeMode === 'ranking') {
      const fetchRanking = async () => {
        const res = await getUrwisRanking()
        if (res.success && res.ranking) {
          setRankingData(res.ranking)
          setIsRankingOpen(true)
          // Resetujemy mode na 'none', bo modal ma własny stan isRankingOpen
          setActiveMode('none')
        }
      }
      fetchRanking()
    }
  }, [activeMode])

  // ✅ DECAY LOKALNY ODPORNY NA USYPIANIE
  useEffect(() => {
    const performTick = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      
      if (deltaSeconds >= 1) {
        lastTickRef.current = now;
        setState(prev => ({
          ...prev,
          hunger: calculateDecay(prev.hunger, deltaSeconds),
          hygiene: calculateDecay(prev.hygiene, deltaSeconds),
          happiness: calculateDecay(prev.happiness, deltaSeconds),
        }));
      }
    };

    const timer = setInterval(performTick, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') performTick();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Bonus za codzienne logowanie
  useEffect(() => {
    const checkDailyLogin = async () => {
      const res = await claimDailyLogin()
      if (res.success) {
        setShowLoginBonus(true)
        setState(prev => ({ ...prev, urwisCoins: prev.urwisCoins + 50 }))
        setTimeout(() => setShowLoginBonus(false), 5000)
      }
    }
    checkDailyLogin()
  }, [])

  const handleAction = async (type: 'feed' | 'wash' | 'play') => {
    startTransition(async () => {
      const res = await interactWithUrwis(type)
  
      if (res.success && res.reward) {
        if (res.newState) {
          lastTickRef.current = Date.now();
          setState(prev => ({
            ...prev,
            hunger: res.newState!.hunger ?? prev.hunger,
            hygiene: res.newState!.hygiene ?? prev.hygiene,
            happiness: res.newState!.happiness ?? prev.happiness,
            urwisCoins: res.newState!.urwisCoins,
            level: res.newState!.level,
            points_earned: res.newState!.points_earned,
            goldenUrwis: res.newState!.goldenUrwis,
            lastInteraction: res.newState!.lastInteraction,
          }))
        }

        setShowSmile(true)
        const coinLabel = res.reward.coins >= 0 ? `+${res.reward.coins}` : `${res.reward.coins}`
        setRewardMessage(`${coinLabel} 🪙 i +${res.reward.exp} EXP`)
        setActiveMode('none')
  
        setTimeout(() => {
          setShowSmile(false)
          setRewardMessage(null)
          setLevelUpData(null)
        }, 4000)
  
        if (res.leveledUp) {
          setLevelUpData({ show: true, lvl: res.newState?.level || state.level + 1 })
        }
      } else if (res.error) {
        alert(res.error)
        setActiveMode('none')
      }
    })
  }
  
  return (
    <div className="max-w-md mx-auto w-full min-h-[85vh] flex flex-col justify-between p-4 bg-white rounded-[40px] shadow-2xl border-4 border-[#0055ff]/10 relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {/* Bonus za logowanie */}
        {showLoginBonus && (
          <motion.div key="login-bonus" initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-[110] flex justify-center px-10">
             <div className="bg-gradient-to-r from-yellow-400 to-[#bf2024] text-white p-4 rounded-3xl shadow-2xl text-center border-4 border-white">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Dzień dobry! 🎁</p>
                <p className="text-xl font-black leading-none">+50 MONET</p>
             </div>
          </motion.div>
        )}

        {/* Informacja o awansie */}
        {levelUpData?.show && (
          <motion.div key="levelup" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 z-[120] flex items-center justify-center bg-[#0055ff]/40 backdrop-blur-md">
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center border-8 border-yellow-400 m-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">NOWY POZIOM!</h2>
                <p className="text-6xl font-black text-[#0055ff] my-2">{levelUpData.lvl}</p>
             </div>
          </motion.div>
        )}

        {/* 🏆 MODAL RANKINGU */}
        {isRankingOpen && (
          <RankingModal 
            key="ranking"
            isOpen={isRankingOpen} 
            onClose={() => setIsRankingOpen(false)} 
            ranking={rankingData} 
          />
        )}
      </AnimatePresence>

      <StatsSection state={state} activeMode={activeMode} />

      <PetDisplay 
        activeMode={activeMode} 
        onActionComplete={handleAction} 
        rewardMessage={rewardMessage} 
        setActiveMode={setActiveMode}
        showSmile={showSmile}
      />
      
      <ActionPanel state={state} activeMode={activeMode} onModeChange={setActiveMode} onAction={handleAction} />
    </div>
  )
}