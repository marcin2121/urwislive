'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function PortalButton() {
  const [isActivating, setIsActivating] = useState(false)
  const router = useRouter()

  // Inicjalizacja dźwięków
  const playSound = (file: string, volume: number = 0.5) => {
    const audio = new Audio(`/audio/${file}`)
    audio.volume = volume
    audio.play().catch(e => console.log("Audio play blocked by browser", e))
  }

  const handlePortalEnter = () => {
    setIsActivating(true)
    
    // 1. Dźwięk narastającej energii (Hum) - Start natychmiast
    playSound('portal-hum.mp3', 0.4)

    // 2. Dźwięk uderzenia (Boom) - Zsynchronizowany z rozbłyskiem (po 0.8s)
    setTimeout(() => {
      playSound('portal-boom.mp3', 0.6)
    }, 800)

    // 3. Nawigacja - Na szczycie rozbłysku
    setTimeout(() => {
      router.push('/mapa')
    }, 1200) 
  }

  return (
    <>
      <button 
        onClick={handlePortalEnter}
        disabled={isActivating}
        className="group relative px-10 py-5 bg-zinc-950 text-white rounded-[2rem] overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center gap-3 font-black uppercase tracking-[0.2em] italic font-fredoka">
          <Sparkles className="text-yellow-400 group-hover:animate-pulse" size={20} />
          Wejdź do Klubu
        </span>
        <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 via-purple-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>

      <AnimatePresence>
  {isActivating && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto bg-transparent overflow-hidden"
    >
      {/* --- MAGICZNY WIR --- */}
      <motion.div 
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1.5, 100], 
          rotate: [0, 45, 90],
        }}
        transition={{ 
          duration: 1.5, 
          ease: [0.7, 0, 0.3, 1],
        }}
        className="relative w-32 h-32 flex items-center justify-center"
      >
        {/* Główna energia portalu (Gradient zamiast czerni) */}
        <div className="absolute inset-0 rounded-full bg-radial-gradient from-blue-500 via-purple-600 to-red-500 shadow-[0_0_100px_rgba(59,130,246,0.8)]" 
             style={{ background: 'radial-gradient(circle, #3b82f6 0%, #9333ea 50%, #ef4444 100%)' }} />
        
        {/* Pierścienie energii */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] border-4 border-dashed border-yellow-400/50 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px] border-2 border-white/30 rounded-full"
        />
      </motion.div>

      {/* ROZBŁYSK (Teraz lekko niebieskawy, nie czysty biały) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 0] }}
        transition={{ 
          duration: 0.8, 
          times: [0, 0.6, 0.8, 1],
          delay: 0.6 
        }}
        className="absolute inset-0 bg-blue-50 z-[10000]"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-20 text-zinc-950 text-center z-[10001]"
      >
        <p className="text-[10px] font-black uppercase tracking-[1em] animate-pulse">Teleportacja w toku...</p>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  )
}