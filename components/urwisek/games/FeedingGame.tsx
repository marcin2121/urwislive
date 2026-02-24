'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FeedingGame({ onComplete }: { onComplete: () => void }) {
  const [foodCount, setFoodCount] = useState(0)
  const [isFlying, setIsFlying] = useState(false)

  const handleThrow = (event: any, info: any) => {
    if (isFlying || info.velocity.y > -500) return
    setIsFlying(true)
    setTimeout(() => {
      const next = foodCount + 1
      if (next >= 3) onComplete()
      else {
        setFoodCount(next)
        setIsFlying(false)
      }
    }, 600)
  }

  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute top-0 w-full text-center">
        <p className="text-[10px] font-black text-[#bf2024] uppercase">Złapane: {foodCount}/3</p>
      </div>
      {!isFlying && (
        <motion.div drag="y" dragConstraints={{top:0, bottom:0}} onDragEnd={handleThrow} className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-grab">
          <span className="text-5xl">🍎</span>
        </motion.div>
      )}
      <AnimatePresence>
        {isFlying && (
          <motion.div initial={{bottom:0, left:'50%', x:'-50%'}} animate={{bottom:'40%', opacity:0, scale:0.5}} className="absolute z-50">
            <span className="text-5xl">🍎</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}