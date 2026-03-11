'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, X, Brain, Zap, Clock, Coins, HelpCircle } from 'lucide-react'
import ArcadeMemoryGame from './games/ArcadeMemoryGame'
import { cn } from '@/lib/utils'

interface ArcadeCenterProps {
  onClose: () => void
  onGameComplete: (coins: number, exp: number) => void
}

export default function ArcadeCenter({ onClose, onGameComplete }: ArcadeCenterProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  const trackArcadeEvent = (gameId: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'arcade_gra_uruchomienie', {
        'event_category': 'Arcade_Center',
        'event_label': gameId
      });
    }
  };

  const handleGameEnd = (won: boolean) => {
    if (won) {
      // Przyznajemy np. 15 monet i trochę exp
      onGameComplete(15, 20)
    }
    setActiveGame(null)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-6 flex flex-col border-4 border-zinc-100 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2.5 rounded-2xl text-purple-600 shadow-sm border border-purple-200/50">
            <Gamepad2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter italic uppercase leading-none">Arcade</h2>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              Centrum Rozrywki
            </p>
          </div>
        </div>
        {!activeGame ? (
          <button onClick={onClose} aria-label="Zamknij arcade" className="bg-zinc-50 p-2.5 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer border border-zinc-200">
             <X size={24} strokeWidth={3} />
          </button>
        ) : (
          <button onClick={() => setActiveGame(null)} className="bg-zinc-50 p-2.5 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer border border-zinc-200 text-xs font-bold px-4">
             Wróć do menu
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative content-start z-10">
        <AnimatePresence mode="wait">
          {!activeGame && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              
              <button 
                onClick={() => { trackArcadeEvent('memory'); setActiveGame('memory'); }}
                className="w-full bg-white border-2 border-zinc-200 hover:border-purple-400 p-4 rounded-3xl flex items-center gap-4 group transition-all"
              >
                <div className="bg-indigo-50 text-indigo-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <Brain size={28} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-black text-lg text-zinc-800 leading-none mb-1">Memory Urwisa</h3>
                  <p className="text-xs font-bold text-zinc-400 flex items-center gap-1">Znajdź pary i wygraj 15 <Coins className="w-3 h-3 text-yellow-500" /></p>
                </div>
                <div className="text-purple-500 font-bold bg-purple-50 px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-widest">
                  Graj
                </div>
              </button>

              <button 
                onClick={() => { trackArcadeEvent('quiz'); window.location.href = '/strefa-zabawy/quiz-urwisa'; }}
                className="w-full bg-white border-2 border-zinc-200 hover:border-amber-400 p-4 rounded-3xl flex items-center gap-4 group transition-all"
              >
                <div className="bg-amber-50 text-amber-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <HelpCircle size={28} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-black text-lg text-zinc-800 leading-none mb-1">Quiz Urwisa</h3>
                  <p className="text-xs font-bold text-zinc-400 flex items-center gap-1">Jakim Urwisem jesteś?</p>
                </div>
                <div className="text-amber-500 font-bold bg-amber-50 px-3 py-1.5 rounded-xl uppercase text-[10px] tracking-widest">
                  Graj
                </div>
              </button>

              <div className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 rounded-3xl flex items-center gap-4 opacity-60 cursor-not-allowed">
                <div className="bg-zinc-200 text-zinc-400 p-3 rounded-2xl">
                  <Zap size={28} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-black text-lg text-zinc-800 leading-none mb-1">Wyścig Zbieraczy</h3>
                  <p className="text-xs font-bold text-zinc-400">Wkrótce dostępne</p>
                </div>
              </div>

            </motion.div>
          )}

          {activeGame === 'memory' && (
            <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <ArcadeMemoryGame onComplete={handleGameEnd} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
