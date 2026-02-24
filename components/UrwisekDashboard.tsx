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
    const [state, setState] = useState<PetState>(() => ({
      ...initialState,
      // Zabezpiecz przed undefined z serwera przy inicjalizacji
      hunger: Number(initialState.hunger) || 0,
      hygiene: Number(initialState.hygiene) || 0,
      happiness: Number(initialState.happiness) || 0,
    }))
    const [isPending, startTransition] = useTransition()
    const [activeMode, setActiveMode] = useState<'none' | 'washing' | 'feeding'>('none')
    const [rewardMessage, setRewardMessage] = useState<string | null>(null)
    const [showSmile, setShowSmile] = useState(false)
    const [levelUpData, setLevelUpData] = useState<{show: boolean, lvl: number} | null>(null)
  
    // ✅ DECAY LOKALNY – jedyne źródło prawdy dla hunger/hygiene/happiness w sesji
    useEffect(() => {
      const timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          hunger: calculateDecay(prev.hunger, 1),
          hygiene: calculateDecay(prev.hygiene, 1),
          happiness: calculateDecay(prev.happiness, 1),
        }))
      }, 1000)
      return () => clearInterval(timer)
    }, [])
  
    // ✅ SYNC TYLKO META-POLA (nie nadpisuj statystyk!)
    // Odpala się TYLKO gdy serwer zwróci nową sesję (np. otwarcie drugiej zakładki)
    const lastSyncedInteraction = useRef(initialState.lastInteraction)
    useEffect(() => {
      if (initialState.lastInteraction !== lastSyncedInteraction.current) {
        lastSyncedInteraction.current = initialState.lastInteraction
        setState(prev => ({
          ...prev,
          // Tylko pola ekonomiczne – statystyki zostawiamy lokalne
          level: initialState.level,
          urwisCoins: initialState.urwisCoins,
          goldenUrwis: initialState.goldenUrwis,
          points_earned: initialState.points_earned,
          lastInteraction: initialState.lastInteraction,
          playerName: initialState.playerName,
          petName: initialState.petName,
        }))
      }
    }, [initialState.lastInteraction])
  
    const handleAction = async (type: 'feed' | 'wash' | 'play') => {
        startTransition(async () => {
          const res = await interactWithUrwis(type)
      
          if (res.success && res.reward) {
            if (res.newState) {
              setState(prev => ({
                ...prev,
                // ?? zamiast || – 0 jest poprawną wartością statystyki!
                hunger: res.newState!.hunger ?? prev.hunger,
                hygiene: res.newState!.hygiene ?? prev.hygiene,
                happiness: res.newState!.happiness ?? prev.happiness,
                urwisCoins: res.newState!.urwisCoins,
                level: res.newState!.level,
                points_earned: res.newState!.points_earned,
                goldenUrwis: res.newState!.goldenUrwis,
                lastInteraction: res.newState!.lastInteraction,
              }))
              // Aktualizuj ref, żeby sync efekt nie nadpisał po revalidatePath
              lastSyncedInteraction.current = res.newState!.lastInteraction
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