'use client'
import React, { useState, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function FeedingGame({ onComplete }: { onComplete: () => void }) {
  const [foodCount, setFoodCount] = useState(0)
  const [isFlying, setIsFlying] = useState(false)
  
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const hasCompleted = useRef(false)

  const handleDragEnd = async (event: any, info: any) => {
    if (!containerRef.current || hasCompleted.current || isFlying) return;

    const vy = info.velocity.y;
    const vx = info.velocity.x;

    // Zabezpieczenie: Jeśli rzut jest za słaby (lub gracz pociągnął w dół), jabłko sprężynuje z powrotem
    if (vy > -200 && info.offset.y > -50) {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', bounce: 0.6 } });
      return;
    }

    setIsFlying(true);

    const rect = containerRef.current.getBoundingClientRect();
    
    // Obliczamy matematyczny punkt startu na ekranie (niewrażliwy na scroll i rozdzielczość)
    const originPageX = info.point.x - info.offset.x;
    const originPageY = info.point.y - info.offset.y;

    // ✅ HITBOX Z WASHING GAME: X (45% - 60%), Y (50% - 60%)
    // Środek buzi w osi Y to ~55%, w osi X to 52.5%
    const targetPageY = rect.top + (rect.height * 0.55);
    const targetPageX = rect.left + (rect.width * 0.525);

    // Wyliczamy dokładną trasę (offset) od punktu startu jabłka do buzi Urwiska
    const targetOffsetY = targetPageY - originPageY;
    const targetOffsetX = targetPageX - originPageX;

    // Tolerancja trafienia - szerokość buzi (ok 15% szerokości obrazka)
    const toleranceX = rect.width * 0.15; 

    let isHit = false;
    
    // 🧠 Fizyka trajektorii: Obliczamy czas dolotu do linii Y (buzi)
    const timeToTarget = (targetOffsetY - info.offset.y) / vy;
    
    if (timeToTarget > 0 && timeToTarget < 2) { // Zabezpieczenie przed rzutami "w kosmos"
      // Przewidujemy, gdzie znajdzie się jabłko w osi X po dotarciu na odpowiednią wysokość
      const intersectOffsetX = info.offset.x + (vx * timeToTarget);
      
      // Sprawdzamy czy przecięcie zmieści się w tolerancji buzi
      if (Math.abs(intersectOffsetX - targetOffsetX) <= toleranceX) {
        isHit = true;
      }
    }

    if (isHit) {
      // 🎯 TRAFIENIE! Jabłko wlatuje do buzi i znika
      await controls.start({
        x: targetOffsetX, 
        y: targetOffsetY,
        scale: 0,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeOut" }
      });

      const next = foodCount + 1;
      // Zliczamy 3 jabłka. Użytkownik nie widzi licznika, ale gra działa w tle.
      if (next >= 3) {
        hasCompleted.current = true;
        onComplete();
      } else {
        setFoodCount(next);
        // Po zjedzeniu "respawnujemy" nowe jabłko na dole
        controls.set({ x: 0, y: 0, scale: 1, opacity: 1 });
        setIsFlying(false);
      }
    } else {
      // ❌ PUDŁO! Jabłko leci dalej poza ekran z rotacją
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

      // Restart jabłka po pudle
      controls.set({ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 });
      setIsFlying(false);
    }
  }

  return (
    // overflow-hidden usunięte - jabłko może startować poza polem obrazka!
    <div ref={containerRef} className="absolute inset-0 z-40 touch-none">
      
      {/* 🍎 Jabłko zespawnowane bardzo nisko (-bottom-28) dla wymuszenia długiego rzutu */}
      <motion.div
        drag={!isFlying} 
        dragMomentum={false} 
        animate={controls}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "none" }}
        className="absolute -bottom-28 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
      >
        <span className="text-6xl drop-shadow-2xl block">🍎</span>
      </motion.div>
      
    </div>
  )
}