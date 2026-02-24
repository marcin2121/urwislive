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
  lastInteraction: string
}

export default function UrwisekDashboard({ initialState }: { initialState: PetState }) {
    const [state, setState] = useState<PetState>(initialState)
    const [isPending, startTransition] = useTransition()
    
    const [activeMode, setActiveMode] = useState<'none' | 'washing' | 'feeding'>('none')
    const [rewardMessage, setRewardMessage] = useState<string | null>(null)
    const [showSmile, setShowSmile] = useState(false) // Nowy stan uśmiechu tutaj
    const [levelUpData, setLevelUpData] = useState<{show: boolean, lvl: number} | null>(null)
  
    // 1. INTELIGENTNA SYNCHRONIZACJA
    useEffect(() => {
      // Synchronizuj tylko gdy naprawdę zmienił się czas w bazie lub poziom
      if (initialState.lastInteraction !== state.lastInteraction || initialState.level !== state.level) {
        setState(initialState)
      }
    }, [initialState.lastInteraction, initialState.level])
  
    // 2. DECAY LOKALNY (Płynność)
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
  
    // 3. OBSŁUGA AKCJI
    const handleAction = async (type: 'feed' | 'wash' | 'play') => {
      startTransition(async () => {
        const res = await interactWithUrwis(type)
        
        if (res.success && res.reward) {
          if (res.newState) {
            setState(prev => ({ ...prev, ...res.newState }));
          }
          
          // Logika uśmiechu
          setShowSmile(true)
          const coinLabel = res.reward.coins >= 0 ? `+${res.reward.coins}` : `${res.reward.coins}`
          setRewardMessage(`${coinLabel} 🪙 i +${res.reward.exp} EXP`)
          
          setActiveMode('none')
  
          // Czyścimy uśmiech i wiadomość po 4 sekundach
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
      <div className="...">
        {/* ... AnimatePresence dla LevelUp itp. ... */}
        <StatsSection state={state} />
        <PetDisplay 
          activeMode={activeMode} 
          onActionComplete={handleAction} 
          rewardMessage={rewardMessage} 
          setActiveMode={setActiveMode}
          showSmile={showSmile} // Przekazujemy stan uśmiechu
        />
        <ActionPanel state={state} activeMode={activeMode} onModeChange={setActiveMode} onAction={handleAction} />
      </div>
    )
  }