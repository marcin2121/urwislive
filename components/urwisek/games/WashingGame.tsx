'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue } from 'framer-motion'

export default function WashingGame({ onComplete }: { onComplete: () => void }) {
  const [washTime, setWashTime] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  
  // 🛡️ Zabezpieczenie: Flaga gwarantująca, że akcja wyśle się tylko raz!
  const hasCompleted = useRef(false)

  useEffect(() => {
    let interval: any
    // Zwiększamy czas tylko jeśli gra się jeszcze nie zakończyła
    if (isScrubbing && washTime < 10 && !hasCompleted.current) {
      interval = setInterval(() => setWashTime(p => Math.min(10, p + 0.1)), 100)
    }
    
    // Uruchamiamy nagrodę i blokujemy kolejne próby
    if (washTime >= 10 && !hasCompleted.current) {
      hasCompleted.current = true; 
      onComplete()
    }
    
    return () => clearInterval(interval)
  }, [isScrubbing, washTime, onComplete])

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const handleMove = (e: any, info: any) => {
    cursorX.set(info.point.x - e.target.getBoundingClientRect().left)
    cursorY.set(info.point.y - e.target.getBoundingClientRect().top)
  }

  return (
    <div className="absolute inset-0 z-40">
      <div 
        className="absolute z-30 cursor-none" 
        style={{ top: '56%', left: '42%', width: '16%', height: '12%' }}
        onMouseEnter={() => setIsScrubbing(true)} 
        onMouseLeave={() => setIsScrubbing(false)} 
      />
      <motion.div className="absolute inset-0 z-40" onPan={handleMove} />
      <motion.div style={{ x: cursorX, y: cursorY }} className="absolute pointer-events-none z-50 -ml-8 -mt-8">
        <span className="text-6xl rotate-12 block">🪥</span>
      </motion.div>
      <div className="absolute top-0 w-full px-8">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-blue-100">
          <motion.div className="h-full bg-[#0055ff]" animate={{ width: `${washTime * 10}%` }} />
        </div>
      </div>
    </div>
  )
}