'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JellyButton from '@/components/ui/JellyButton'
import { Card } from '@/components/ui/card'
import { Heart, Utensils, Sparkles, Trophy, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactWithUrwis } from '@/app/actions/tamagotchi'

// Definiujemy typy dla danych początkowych z bazy
interface UrwisState {
  hunger: number;
  happiness: number;
  points: number;
}

interface UrwisTamagotchiProps {
  initialState: UrwisState;
}

export default function UrwisTamagotchi({ initialState }: UrwisTamagotchiProps) {
  // Stan inicjowany bezpiecznymi danymi z serwera
  const [hunger, setHunger] = useState(initialState.hunger)
  const [happiness, setHappiness] = useState(initialState.happiness)
  const [points, setPoints] = useState(initialState.points)

  const [isFeeding, setIsFeeding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isOnline, setIsOnline] = useState(true)

  // 1. Sprawdzanie statusu połączenia (Mobile-First / PWA)
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 2. Logika spadku statystyk w czasie (wizualna - prawdziwa i tak przelicza się na serwerze)
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger((prev) => Math.max(0, prev - 1))
      setHappiness((prev) => Math.max(0, prev - 0.5))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // 3. Główna funkcja interakcji zintegrowana z Server Actions
  const handleAction = (actionType: 'feed' | 'play') => {
    if (!isOnline) {
      alert("Brak internetu! Połącz się z siecią, aby zaopiekować się Urwisem.")
      return
    }

    if (actionType === 'feed') setIsFeeding(true)

    startTransition(async () => {
      const result = await interactWithUrwis(actionType)
      
      if (result.error) {
        alert(result.error) // Tu docelowo możemy wpiąć ładne toasty z shadcn/ui
      } else if (result.success && result.newState) {
        // Aktualizacja stanu potwierdzonymi danymi z backendu
        setHunger(result.newState.hunger)
        setHappiness(result.newState.happiness)
        setPoints(result.newState.points)
      }
      
      if (actionType === 'feed') {
        setTimeout(() => setIsFeeding(false), 1000)
      }
    })
  }

  return (
    <Card className="p-6 max-w-md mx-auto bg-linear-to-br from-yellow-50 to-orange-100 border-4 border-orange-200 rounded-[32px] shadow-2xl relative overflow-hidden">
      
      {/* Ostrzeżenie Offline - nakładka */}
      {!isOnline && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs font-bold py-1 px-4 flex items-center justify-center gap-2 z-50">
          <WifiOff className="w-3 h-3" />
          <span>Brak połączenia. Gra wstrzymana.</span>
        </div>
      )}

      <div className={cn("flex justify-between mb-6", !isOnline && "mt-4")}>
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
          <Trophy className="text-yellow-500 w-5 h-5" />
          <span className="font-black text-orange-600">{points} pkt</span>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Akademia Urwisa</p>
          <p className="text-sm font-black text-gray-800">Białobrzegi</p>
        </div>
      </div>

      {/* Wyświetlacz Urwisa */}
      <div className="relative bg-white aspect-square rounded-2xl border-4 border-orange-100 overflow-hidden mb-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={isFeeding ? 'feeding' : 'idle'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn("relative", !isOnline && "grayscale opacity-50")}
          >
            {/* Tutaj model 3D (urwis.glb) lub Fallback 2D */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: isFeeding ? [0, 10, -10, 0] : 0
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-8xl"
            >
              {hunger < 30 ? '😢' : isFeeding ? '😋' : '🦖'}
            </motion.div>
            
            {isFeeding && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -50, opacity: 1 }}
                className="absolute top-0 right-0"
              >
                <Sparkles className="text-yellow-400 w-8 h-8" />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Statystyki */}
      <div className="space-y-4 mb-8">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-black uppercase text-gray-600">
            <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> Głód</span>
            <span>{hunger}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-inner">
            <motion.div 
              className="h-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${hunger}%` }}
              transition={{ type: "spring", bounce: 0 }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-black uppercase text-gray-600">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Szczęście</span>
            <span>{happiness}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-inner">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${happiness}%` }}
              transition={{ type: "spring", bounce: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Przyciski Akcji */}
      <div className="grid grid-cols-2 gap-4">
        <JellyButton 
          variant={!isOnline ? "secondary" : "primary"}
          onClick={() => handleAction('feed')}
          disabled={isPending || !isOnline}
          className="py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && isFeeding ? 'Mniam...' : 'Karm Urwisa'}
        </JellyButton>
        <JellyButton 
          variant={!isOnline ? "secondary" : "blue"}
          onClick={() => handleAction('play')}
          disabled={isPending || !isOnline}
          className="py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && !isFeeding ? 'Zabawa...' : 'Baw się'}
        </JellyButton>
      </div>

      <p className="mt-6 text-center text-[10px] text-gray-400 font-bold leading-tight">
        Wymieniaj punkty na nagrody na<br/>
        <span className="text-orange-500">ul. Reymonta 38A, Białobrzegi</span>
      </p>
    </Card>
  )
}