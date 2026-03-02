'use client'

import React, { useState, useEffect } from 'react'
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
    // Tasowanie kart
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }, [])
  
  const handleCardClick = (index: number) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return
    
    setFlipped(prev => [...prev, index])
    
    if (flipped.length === 1) {
      setDisabled(true)
      const firstIndex = flipped[0]
      const secondIndex = index
      
      if (cards[firstIndex] === cards[secondIndex]) {
        setMatched(prev => [...prev, firstIndex, secondIndex])
        setFlipped([])
        setDisabled(false)
      } else {
        setTimeout(() => {
          setFlipped([])
          setDisabled(false)
        }, 800)
      }
    }
  }

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setTimeout(() => onComplete(true), 1500)
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
