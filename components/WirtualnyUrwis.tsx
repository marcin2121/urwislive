'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JellyButton from '@/components/ui/JellyButton'
import { Card } from '@/components/ui/card'
import { Heart, Utensils, Sparkles, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interactWithUrwis } from '@/app/actions/tamagotchi'
// Wykorzystujemy istniejący styl JellyButton do interakcji
// Gra promuje lokalizację w Białobrzegach poprzez system nagród

export default function WirtualnyUrwis() {
  const [hunger, setHunger] = useState(80)
  const [happiness, setHappiness] = useState(70)
  const [points, setPoints] = useState(0)
  const [isFeeding, setIsFeeding] = useState(false)
  
  const lastTickRef = useRef<number>(0)

  // Logika spadku statystyk w czasie (wymaga internetu do synchronizacji z serwerem)
  useEffect(() => {
    lastTickRef.current = Date.now()
    const timer = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - lastTickRef.current) / 1000 // sekundy
      if (elapsed >= 5) {
        const ticks = Math.floor(elapsed / 5)
        lastTickRef.current += ticks * 5000
        
        setHunger((prev) => Math.max(0, prev - (1 * ticks)))
        setHappiness((prev) => Math.max(0, prev - (0.5 * ticks)))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleFeed = () => {
    setIsFeeding(true)
    setHunger((prev) => Math.min(100, prev + 15))
    setPoints((prev) => prev + 5)
    setTimeout(() => setIsFeeding(false), 1000)
  }

  const handlePlay = () => {
    setHappiness((prev) => Math.min(100, prev + 20))
    setPoints((prev) => prev + 10)
  }

  return (
    <Card className="p-6 max-w-md mx-auto bg-linear-to-br from-yellow-50 to-orange-100 border-4 border-orange-200 rounded-[32px] shadow-2xl">
      <div className="flex justify-between mb-6">
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
            className="relative"
          >
            {/* Tutaj docelowo znajdzie się Twój model 3D lub ilustracja urwis-welcome.webp */}
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
            />
          </div>
        </div>
      </div>

      {/* Przyciski Akcji */}
      <div className="grid grid-cols-2 gap-4">
        <JellyButton 
          variant="primary" 
          onClick={handleFeed}
          className="py-3 text-sm"
        >
          Karm Urwisa
        </JellyButton>
        <JellyButton 
          variant="blue" 
          onClick={handlePlay}
          className="py-3 text-sm"
        >
          Baw się
        </JellyButton>
      </div>

      <p className="mt-6 text-center text-[10px] text-gray-400 font-bold leading-tight">
        Zbieraj punkty i odbieraj nagrody stacjonarnie w<br/>
        <span className="text-orange-500">Sklepie Urwis - Reymonta 38A, Białobrzegi</span>
      </p>
    </Card>
  )
}