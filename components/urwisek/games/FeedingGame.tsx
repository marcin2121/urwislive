'use client'
import React, { useState, useRef } from 'react'
import { motion, useAnimation, AnimatePresence, PanInfo } from 'framer-motion'
import { toast } from 'sonner'

export default function FeedingGame({ onComplete }: { onComplete: () => void }) {
  const [foodCount, setFoodCount] = useState(0)
  const [isFlying, setIsFlying] = useState(false)
  
  const controls = useAnimation()
  const hasCompleted = useRef(false)

  // 🚀 FUNKCJA SYNCHRONIZACJI (BACKGROUND SYNC READY)
  const handleSyncPoints = async (xpGain: number) => {
    try {
      const response = await fetch("/api/urwis/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "experience", amount: xpGain }),
      });
  
      if (!response.ok) {
        // Serwist przechwyci to nieudane żądanie i doda do kolejki IndexedDB
      }
    } catch (_err) {
      // Fetch rzuca wyjątek przy całkowitym braku sieci
      toast.info("Brak sieci. Punkty zostaną wysłane automatycznie w tle po odzyskaniu połączenia.");
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hasCompleted.current || isFlying) return;

    const vy = info.velocity.y;
    const vx = info.velocity.x;

    if (vy > -200) {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', bounce: 0.6 } });
      return;
    }

    setIsFlying(true);

    const urwisekImg = document.getElementById('urwisek-image');
    if (!urwisekImg) return;

    const targetRect = urwisekImg.getBoundingClientRect();
    const startPageX = info.point.x - info.offset.x;
    const startPageY = info.point.y - info.offset.y;

    const mouthPageX = targetRect.left + (targetRect.width * 0.50);
    const mouthPageY = targetRect.top + (targetRect.height * 0.58); 

    const distanceY = mouthPageY - startPageY;
    const distanceX = mouthPageX - startPageX;
    const toleranceX = targetRect.width * 0.15; 

    let isHit = false;
    const timeToTarget = (distanceY - info.offset.y) / vy;
    
    if (timeToTarget > 0 && timeToTarget < 2) {
      const intersectOffsetX = info.offset.x + (vx * timeToTarget);
      if (Math.abs(intersectOffsetX - distanceX) <= toleranceX) {
        isHit = true;
      }
    }

    if (isHit) {
      // 🎯 TRAFIENIE
      await controls.start({
        x: distanceX, 
        y: distanceY,
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      });

      const next = foodCount + 1;
      setFoodCount(next);

      // 🚀 WYSYŁAMY PUNKTY XP (10 pkt za każde jabłko)
      handleSyncPoints(10);
      
      if (next >= 3) {
        hasCompleted.current = true;
        setTimeout(() => onComplete(), 600);
      } else {
        controls.set({ x: 0, y: 0, scale: 1, opacity: 1 });
        setIsFlying(false);
      }
    } else {
      // ❌ PUDŁO
      const missX = info.offset.x + (vx * 0.5);
      const missY = info.offset.y + (vy * 0.5);

      await controls.start({
        x: missX, y: missY,
        opacity: 0, scale: 0.5,
        rotate: vx > 0 ? 180 : -180,
        transition: { duration: 0.4, ease: "linear" }
      });

      controls.set({ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 });
      setIsFlying(false);
    }
  }

  return (
    <div className="absolute inset-0 z-40 touch-none flex items-center pointer-events-none">
      
      {/* PASEK POSTĘPU */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-4 flex flex-col items-center gap-4 bg-white/40 backdrop-blur-xl p-3 rounded-full border-4 border-white shadow-2xl z-50 pointer-events-none"
      >
        {[2, 1, 0].map((slotIndex) => (
          <div 
            key={slotIndex} 
            className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-all duration-500 ${
              foodCount > slotIndex 
                ? 'bg-white border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                : 'bg-gray-200/50 border-2 border-white/50 shadow-inner'
            }`}
          >
            <AnimatePresence>
              {foodCount > slotIndex && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute text-2xl"
                >
                  🍎
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* JABŁKO */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center w-full">
        <motion.div
          drag={!isFlying} 
          dragMomentum={false} 
          animate={controls}
          whileDrag={{ scale: 1.1, rotate: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 0.2 } }}
          onDragEnd={handleDragEnd}
          style={{ touchAction: "none" }}
          className="pointer-events-auto cursor-grab active:cursor-grabbing"
        >
          <span className="text-7xl drop-shadow-2xl block">🍎</span>
        </motion.div>
      </div>
      
    </div>
  )
}