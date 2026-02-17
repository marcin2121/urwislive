'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'

interface FloatingKuleczka {
  id: number
  x: number
  y: number
  isCollecting: boolean
  targetPos?: { x: number; y: number }
}

export default function KuleczkaCollector() {
  const { profile, supabase, session } = useSupabaseAuth()
  const [activeKuleczki, setActiveKuleczki] = useState<FloatingKuleczka[]>([])

  const spawnKuleczka = () => {
    // Teraz NIE sprawdzamy sesji tutaj - pozwalamy kuleczkom się pojawiać
    const newKuleczka = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15,
      isCollecting: false
    }
    setActiveKuleczki(prev => [...prev, newKuleczka])

    setTimeout(() => {
      setActiveKuleczki(prev => prev.filter(k => k.id !== newKuleczka.id || k.isCollecting))
    }, 15000)
  }

  useEffect(() => {
    // Spawner działa dla każdego
    const timer = setInterval(() => {
      if (Math.random() > 0.4 && activeKuleczki.length < 3) spawnKuleczka()
    }, 30000)
    return () => clearInterval(timer)
  }, [activeKuleczki.length])

  const handleCollect = async (kuleczka: FloatingKuleczka) => {
    if (kuleczka.isCollecting) return

    // --- TRYB DLA NIEZALOGOWANYCH ---
    if (!session) {
      // 1. Usuwamy kuleczkę natychmiast
      setActiveKuleczki(prev => prev.filter(k => k.id !== kuleczka.id))
      
      // 2. Wywołujemy globalne zdarzenie otwarcia modalu (opisane niżej)
      window.dispatchEvent(new CustomEvent('open-auth-modal', { 
        detail: { message: "Złapałeś kuleczkę! 🔵 Załóż konto, aby zbierać punkty!" } 
      }))
      return
    }

    // --- TRYB DLA ZALOGOWANYCH (Lot do StatsBar) ---
    const targetElement = document.getElementById('kuleczka-target')
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    
    setActiveKuleczki(prev => prev.map(k => 
      k.id === kuleczka.id 
        ? { ...k, isCollecting: true, targetPos: { x: rect.left, y: rect.top } } 
        : k
    ))

    setTimeout(async () => {
      setActiveKuleczki(prev => prev.filter(k => k.id !== kuleczka.id))
      const currentKuleczki = profile?.kuleczki ?? 0
      await supabase
        .from('profiles')
        .update({ kuleczki: currentKuleczki + 5 })
        .eq('id', profile?.id)
    }, 800)
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-100">
      <AnimatePresence>
        {activeKuleczki.map((kuleczka) => (
          <motion.div
            key={kuleczka.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={kuleczka.isCollecting ? {
              left: kuleczka.targetPos?.x,
              top: kuleczka.targetPos?.y,
              scale: 0.3,
              opacity: 0,
              transition: { duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95] }
            } : {
              left: `${kuleczka.x}%`,
              top: `${kuleczka.y}%`,
              scale: 1,
              opacity: 1,
              y: [0, -20, 0],
              transition: { y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }
            }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="absolute pointer-events-auto cursor-pointer"
            onClick={() => handleCollect(kuleczka)}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-400 blur-xl opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center">
                <div className="absolute top-1 left-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]" />
                <span className="text-[10px] font-black text-white">+5</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}