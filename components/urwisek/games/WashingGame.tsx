'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue } from 'framer-motion'

export default function WashingGame({ onComplete }: { onComplete: () => void }) {
  const [washTime, setWashTime] = useState(0)
  
  // 🛡️ Ochrona przed wielokrotnym wysłaniem nagrody
  const hasCompleted = useRef(false)
  
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sprawdzanie czy osiągnięto 100% (10 * 10 = 100%)
  useEffect(() => {
    if (washTime >= 10 && !hasCompleted.current) {
      hasCompleted.current = true
      onComplete()
    }
  }, [washTime, onComplete])

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || hasCompleted.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Ruch szczoteczki za kursorem
    cursorX.set(x)
    cursorY.set(y)

    // Obliczamy pozycję w procentach kontenera
    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100

    // ✅ ZAMAPOWANY HITBOX ZĘBÓW (Wartości ustawione przez Ciebie)
    const minX = 45;
    const maxX = 60;
    const minY = 50;
    const maxY = 60;

    const inTeethHitbox = percentX > minX && percentX < maxX && percentY > minY && percentY < maxY

    // Dodajemy postęp TYLKO jeśli kursor JEST w hitboxie zębów i wciąż nim ruszamy
    if (inTeethHitbox) {
      // 0.05 to szybkość mycia. Jeśli będzie szło za wolno, zmień na 0.1
      setWashTime(prev => Math.min(10, prev + 0.01))
    }
  }

  return (
    <div 
      ref={containerRef}
      // touch-none zapobiega przewijaniu ekranu na telefonie podczas mycia
      className="absolute inset-0 z-40 touch-none cursor-none"
      onPointerMove={handlePointerMove}
    >
      {/* 🪥 Szczoteczka podążająca za palcem/myszką (Ujednolicone wektorowe Twemoji) */}
      <motion.div style={{ x: cursorX, y: cursorY }} className="absolute pointer-events-none z-50 -ml-7 -mt-7 flex items-center justify-center w-14 h-14">
        <img 
          src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1faa5.svg" 
          alt="Szczoteczka"
          draggable={false}
          className="w-12 h-12 rotate-12 drop-shadow-md pointer-events-none select-none" 
        />
      </motion.div>
      
      {/* 📊 Pasek postępu mycia na samej górze gry */}
      <div className="absolute top-0 w-full px-8 pointer-events-none">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-blue-100 shadow-inner">
          <motion.div 
            className="h-full bg-[#0055ff]" 
            animate={{ width: `${washTime * 10}%` }} 
            // Bardzo krótki czas animacji, aby pasek ładował się płynnie podczas ruchów
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  )
}