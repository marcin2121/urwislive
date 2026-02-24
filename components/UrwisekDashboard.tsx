'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

// Importy komponentów modułowych
import StatsSection from './urwisek/StatsSection'
import ActionPanel from './urwisek/ActionPanel'
import PetDisplay from './urwisek/PetDisplay'

// Importy logiki i akcji
import { interactWithUrwis, claimDailyLogin } from '@/app/actions/tamagotchi'
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
}

export default function UrwisekDashboard({ initialState }: { initialState: PetState }) {
  // Stan inicjalizowany danymi z serwera (tylko raz przy montowaniu)
  const [state, setState] = useState<PetState>(initialState)
  const [isPending, startTransition] = useTransition()
  
  // Stany pomocnicze
  const [activeMode, setActiveMode] = useState<'none' | 'washing' | 'feeding'>('none')
  const [rewardMessage, setRewardMessage] = useState<string | null>(null)
  const [showLoginBonus, setShowLoginBonus] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{show: boolean, lvl: number} | null>(null)

  // REF do śledzenia wersji danych z serwera - zapobiega migotaniu
  const lastServerUpdate = useRef(JSON.stringify(initialState))

  // 1. INTELIGENTNA SYNCHRONIZACJA Z SERWEREM
  // Aktualizuje stan tylko wtedy, gdy dane z serwera istotnie się zmieniły (np. po karmieniu)
  useEffect(() => {
    const currentProps = JSON.stringify(initialState)
    if (currentProps !== lastServerUpdate.current) {
      setState(initialState)
      lastServerUpdate.current = currentProps
    }
  }, [initialState])

  // 2. PŁYNNY DECAY LOKALNY (Co 1 sekunda)
  // Oblicza spadek statystyk w czasie rzeczywistym w przeglądarce
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        hunger: calculateDecay(prev.hunger, 1),
        hygiene: calculateDecay(prev.hygiene, 1),
        happiness: calculateDecay(prev.happiness, 1)
      }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 3. Obsługa interakcji (Karmienie, Mycie, Zabawa)
  const handleAction = async (type: 'feed' | 'wash' | 'play') => {
    startTransition(async () => {
      const res = await interactWithUrwis(type)
      
      if (res.success && res.reward) {
        // Natychmiastowa aktualizacja lokalna po udanej akcji
        if (res.newState) {
          const updatedState = { ...state, ...res.newState };
          setState(updatedState);
          // Aktualizujemy ref, aby useEffect nie nadpisał stanu starymi danymi przed rewalidacją
          lastServerUpdate.current = JSON.stringify(updatedState);
        }
        
        if (res.leveledUp) {
          setLevelUpData({ show: true, lvl: res.newState?.level || state.level + 1 })
          setTimeout(() => setLevelUpData(null), 6000)
        }

        const coinLabel = res.reward.coins >= 0 ? `+${res.reward.coins}` : `${res.reward.coins}`
        setRewardMessage(`${res.reward.isDailyBonus ? 'BONUS DNIA! ' : ''}${coinLabel} 🪙 i +${res.reward.exp} EXP`)
        
        setActiveMode('none')
        setTimeout(() => setRewardMessage(null), 4000)
      } else if (res.error) {
        alert(res.error)
        setActiveMode('none')
      }
    })
  }

  // Bonus za logowanie (tylko raz przy wejściu)
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

  return (
    <div className="max-w-md mx-auto w-full min-h-[85vh] flex flex-col justify-between p-4 bg-white rounded-[40px] shadow-2xl border-4 border-[#0055ff]/10 relative overflow-hidden">
      <AnimatePresence>
        {showLoginBonus && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-[110] flex justify-center px-10">
             <div className="bg-gradient-to-r from-yellow-400 to-[#bf2024] text-white p-4 rounded-3xl shadow-2xl text-center border-4 border-white">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Dzień dobry! 🎁</p>
                <p className="text-xl font-black leading-none">+50 MONET</p>
             </div>
          </motion.div>
        )}
        {levelUpData?.show && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 z-[120] flex items-center justify-center bg-[#0055ff]/40 backdrop-blur-md">
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center border-8 border-yellow-400 m-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">NOWY POZIOM!</h2>
                <p className="text-6xl font-black text-[#0055ff] my-2">{levelUpData.lvl}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatsSection state={state} />
      <PetDisplay activeMode={activeMode} onActionComplete={handleAction} rewardMessage={rewardMessage} setActiveMode={setActiveMode} />
      <ActionPanel state={state} activeMode={activeMode} onModeChange={setActiveMode} onAction={handleAction} />
    </div>
  )
}