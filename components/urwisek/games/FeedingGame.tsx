'use client'
import React, { useState, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function FeedingGame({ onComplete }: { onComplete: () => void }) {
  const [foodCount, setFoodCount] = useState(0)
  const [isFlying, setIsFlying] = useState(false)
  
  const controls = useAnimation()
  const hasCompleted = useRef(false)

  const handleDragEnd = async (event: any, info: any) => {
    if (hasCompleted.current || isFlying) return;

    const vy = info.velocity.y;
    const vx = info.velocity.x;

    // Jeśli gracz nie machnął palcem w górę (prędkość w dół lub zerowa)
    if (vy > -200) {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', bounce: 0.6 } });
      return;
    }

    setIsFlying(true);

    // Szukamy obrazka Urwiska żyjącego w DOM na podstawie ID
    const urwisekImg = document.getElementById('urwisek-image');
    if (!urwisekImg) return;

    const targetRect = urwisekImg.getBoundingClientRect();
    
    // Punkt, z którego palec puścił jabłko
    const startPageX = info.point.x - info.offset.x;
    const startPageY = info.point.y - info.offset.y;

    // 🎯 Hitbox buzi: idealnie środek w poziomie i lekko poniżej środka w pionie względem obrazka Urwiska
    const mouthPageX = targetRect.left + (targetRect.width * 0.50);
    const mouthPageY = targetRect.top + (targetRect.height * 0.58); // 58% wysokości to usta

    // Dokładny wektor od punktu startu do buzi na ekranie
    const distanceY = mouthPageY - startPageY;
    const distanceX = mouthPageX - startPageX;

    // Tolerancja spudłowania na boki
    const toleranceX = targetRect.width * 0.15; 

    let isHit = false;
    
    // Obliczamy trajektorię "w locie"
    const timeToTarget = (distanceY - info.offset.y) / vy;
    
    if (timeToTarget > 0 && timeToTarget < 2) {
      const intersectOffsetX = info.offset.x + (vx * timeToTarget);
      
      // Jeśli trajektoria przetnie linię w granicach tolerancji ust
      if (Math.abs(intersectOffsetX - distanceX) <= toleranceX) {
        isHit = true;
      }
    }

    if (isHit) {
      // 🎯 TRAFIENIE! Jabłko idealnie wlatuje w obszar ust i znika
      await controls.start({
        x: distanceX, 
        y: distanceY,
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      });

      const next = foodCount + 1;
      if (next >= 3) {
        hasCompleted.current = true;
        onComplete();
      } else {
        setFoodCount(next);
        controls.set({ x: 0, y: 0, scale: 1, opacity: 1 });
        setIsFlying(false);
      }
    } else {
      // ❌ PUDŁO!
      const missX = info.offset.x + (vx * 0.5);
      const missY = info.offset.y + (vy * 0.5);

      await controls.start({
        x: missX,
        y: missY,
        opacity: 0,
        scale: 0.5,
        rotate: vx > 0 ? 180 : -180,
        transition: { duration: 0.4, ease: "linear" }
      });

      controls.set({ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 });
      setIsFlying(false);
    }
  }

  return (
    // Kontener ustawiony absolutnie, wypełniający całą wolną przestrzeń
    <div className="absolute inset-0 z-40 touch-none flex flex-col justify-between items-center pointer-events-none pb-4">
      
      {/* 📊 Surowy napis na górze, bez teł i obramowań */}
      <div className="mt-6 w-full text-center z-50">
        <p className="text-2xl font-black text-[#bf2024] uppercase drop-shadow-md">
          Nakarm: {foodCount}/3
        </p>
      </div>

      {/* 🍎 Jabłko na samym dole przestrzeni (pointer-events-auto przywraca mu dotykalność) */}
      <motion.div
        drag={!isFlying} 
        dragMomentum={false} 
        animate={controls}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "none" }}
        className="pointer-events-auto cursor-grab active:cursor-grabbing mb-4"
      >
        <span className="text-7xl drop-shadow-2xl block hover:scale-110 transition-transform">🍎</span>
      </motion.div>
      
    </div>
  )
}