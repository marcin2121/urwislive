'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

const EMOJIS = ['🍎', '🍕', '🍔', '🍓', '🍌', '🍉', '🍇', '🍒']

interface MemoryGameProps {
  onComplete: (won: boolean) => void
}

export default function ArcadeMemoryGame({ onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [disabled, setDisabled] = useState(false)
  
  useEffect(() => {
    // Tasowanie kart - Fisher-Yates shuffle would be better, but keeping it simple for now
    // Just move it inside useEffect to be safe
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }, [])
  
  const handleCardClick = useCallback((index: number) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return
    
    if (flipped.length === 0) {
      setFlipped([index])
    } else if (flipped.length === 1) {
      setDisabled(true)
      const firstIndex = flipped[0]
      const secondIndex = index
      
      setFlipped([firstIndex, secondIndex])
      
      if (cards[firstIndex] === cards[secondIndex]) {
        setMatched(prev => [...prev, firstIndex, secondIndex])
        setTimeout(() => {
          setFlipped([])
          setDisabled(false)
        }, 500)
      } else {
        setTimeout(() => {
          setFlipped([])
          setDisabled(false)
        }, 800)
      }
    }
  }, [disabled, flipped, matched, cards])

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      const timer = setTimeout(() => onComplete(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [matched, cards, onComplete])

  return (
    <div className="flex flex-col items-center justify-center p-2 pt-6 relative">
      
      <div className="grid grid-cols-4 gap-3">
        {cards.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index)
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-2xl sm:text-3xl flex items-center justify-center transition-all shadow-sm ${
                isFlipped ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-indigo-500 border-b-4 border-indigo-700 hover:bg-indigo-400 cursor-pointer'
              }`}
            >
              <div className={isFlipped ? '' : 'text-white/20 font-black'}>
                 {isFlipped ? emoji : '?'}
              </div>
            </motion.button>
          )
        })}
      </div>
      
      {matched.length === cards.length && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mb-2 drop-shadow-lg" />
          <h2 className="text-3xl font-black text-zinc-900 uppercase">Zwycięstwo!</h2>
          <p className="font-bold text-zinc-500 mt-2">+15 Monet / +20 EXP</p>
        </motion.div>
      )}
    </div>
  )
}
