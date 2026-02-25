'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Wewnętrzny komponent pojedynczego balona - ułatwia zarządzanie fizyką każdego z nich
const Balloon = ({ id, startX, duration, hue, onPop, onMiss }: any) => {
  // Zabezpieczenie przed wyciekiem pamięci (balon sam się usuwa po wyleceniu za ekran)
  useEffect(() => {
    const timer = setTimeout(() => onMiss(id), duration * 1000 + 500)
    return () => clearTimeout(timer)
  }, [id, duration, onMiss])

  return (
    <motion.div
      initial={{ top: '100%', left: `${startX}%`, scale: 0.5, opacity: 0 }}
      animate={{ 
        top: '-20%', // Wylatuje wysoko poza górną krawędź
        scale: 1, 
        opacity: 1,
        x: [0, 30, -30, 0] // Efekt znoszenia przez wiatr (wężyk)
      }}
      exit={{ scale: 1.5, opacity: 0 }} // Efekt pęknięcia
      transition={{ 
        top: { duration: duration, ease: 'linear' },
        x: { duration: duration * 0.4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
        opacity: { duration: 0.3 },
        scale: { duration: 0.15 } 
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        onPop(id)
      }}
      className="absolute cursor-crosshair pointer-events-auto w-24 h-24 flex items-center justify-center -ml-12"
      style={{ filter: `hue-rotate(${hue}deg)` }} // Zmienia kolor balona!
    >
      <span className="text-7xl drop-shadow-xl block">🎈</span>
    </motion.div>
  )
}

export default function PlayingGame({ onComplete }: { onComplete: () => void }) {
  const [score, setScore] = useState(0)
  const [balloons, setBalloons] = useState<{id: number, x: number, duration: number, hue: number}[]>([])
  
  const balloonIdCounter = useRef(0)
  const hasCompleted = useRef(false)
  const TARGET_SCORE = 25 // Musisz zbić 10 balonów!

  // 🎈 Pętla generująca nowe balony
  useEffect(() => {
    if (hasCompleted.current) return

    const spawnBalloon = () => {
      setBalloons(prev => {
        // Maksymalnie 6 balonów na ekranie jednocześnie (żeby nie zaciąć telefonu)
        if (prev.length >= 6) return prev

        balloonIdCounter.current += 1
        const newBalloon = {
          id: balloonIdCounter.current,
          x: Math.floor(Math.random() * 70) + 15, // Start od 15% do 85% szerokości
          duration: Math.random() * 2 + 2, // Lecą od 2 do 4 sekund (szybkie i wolne)
          hue: Math.floor(Math.random() * 360) // Losowy kolor tęczy
        }
        return [...prev, newBalloon]
      })
    }

    // Co 500ms wypuszczamy nowy balon
    const interval = setInterval(spawnBalloon, 500)
    return () => clearInterval(interval)
  }, [])

  // Sprawdzanie wygranej
  useEffect(() => {
    if (score >= TARGET_SCORE && !hasCompleted.current) {
      hasCompleted.current = true
      // Dajemy ułamek sekundy na zobaczenie efektu pęknięcia ostatniego balona
      setTimeout(() => {
        onComplete()
      }, 400) 
    }
  }, [score, onComplete])

  // Obsługa pęknięcia balona
  const handlePop = (id: number) => {
    if (hasCompleted.current) return
    setBalloons(prev => prev.filter(b => b.id !== id))
    setScore(s => s + 1)
  }

  // Obsługa balona, który uciekł (nie kliknięto go)
  const handleMiss = (id: number) => {
    setBalloons(prev => prev.filter(b => b.id !== id))
  }

  return (
    // overflow-hidden upewnia się, że gra nie "rozepcha" strony, a balony grzecznie znikną na górze
    <div className="absolute inset-0 z-40 touch-none overflow-hidden pb-4">
      
      {/* 📊 Licznik zbitych balonów */}
      <div className="mt-6 w-full text-center z-50 pointer-events-none">
        <p className="text-2xl font-black text-pink-500 uppercase drop-shadow-md">
          Zbij balony: {score}/{TARGET_SCORE}
        </p>
      </div>

      {/* Renderowanie aktywnych balonów */}
      <AnimatePresence>
        {balloons.map(b => (
          <Balloon 
            key={b.id} 
            id={b.id} 
            startX={b.x} 
            duration={b.duration} 
            hue={b.hue}
            onPop={handlePop}
            onMiss={handleMiss}
          />
        ))}
      </AnimatePresence>

    </div>
  )
}