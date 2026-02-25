'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

// Importujemy minigry
import WashingGame from './games/WashingGame'
import FeedingGame from './games/FeedingGame'

export default function PetDisplay({ activeMode, onActionComplete, setActiveMode, rewardMessage, showSmile }: any) {
  
  const getPetImageSrc = () => {
    if (showSmile) return "/urwisek/usmiech.webp";
    if (activeMode === 'washing') return "/urwisek/mycie.webp";
    if (activeMode === 'feeding') return "/urwisek/jedzenie.webp";
    return "/urwisek/urwisek.webp";
  };

  return (
    // Zmieniamy na flex-col i dajemy 'justify-start pt-2', żeby Urwisek przykleił się do sufitu podczas karmienia
    <div className={`flex-1 flex flex-col items-center relative mt-4 mb-4 transition-all duration-500 ${activeMode === 'feeding' ? 'justify-start pt-2' : 'justify-center'}`}>
      
      <AnimatePresence>
        {rewardMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 z-50 bg-[#0055ff] text-white px-4 py-2 rounded-2xl font-black text-xs shadow-xl text-center"
          > 
            {rewardMessage} 
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-64 h-64 flex items-center justify-center z-10">
        <Image 
          id="urwisek-image" // 👈 DODANE ID! To nasz "celownik" dla jabłka
          src={getPetImageSrc()} 
          alt="Urwisek" 
          width={256} height={256} 
          className="object-contain drop-shadow-2xl transition-all duration-300" 
          priority 
        />

        <AnimatePresence>
          {showSmile && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.3, opacity: 0.5 }} exit={{ opacity: 0 }} className="absolute z-20">
              <Sparkles className="w-48 h-48 text-yellow-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mycie zostaje wewnątrz małego kwadratu */}
        {activeMode === 'washing' && (
          <WashingGame onComplete={() => onActionComplete('wash')} />
        )}
      </div>

      {/* 🚀 Karmienie wychodzi POZA kwadrat, na całą przestrzeń! */}
      {activeMode === 'feeding' && (
        <FeedingGame onComplete={() => onActionComplete('feed')} />
      )}

      {activeMode !== 'none' && (
        <button 
          onClick={() => setActiveMode('none')} 
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full text-[#bf2024] shadow-md border z-50 hover:bg-red-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}