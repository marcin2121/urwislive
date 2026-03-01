'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

// Importujemy minigry
import WashingGame from './games/WashingGame'
import FeedingGame from './games/FeedingGame'
import PlayingGame from './games/PlayingGame'

export default function PetDisplay({ activeMode, onActionComplete, setActiveMode, rewardMessage, showSmile, state }: any) {
  
  const getPetImageSrc = () => {
    if (showSmile) return "/urwisek/usmiech.webp";
    if (activeMode === 'washing') return "/urwisek/mycie.webp";
    if (activeMode === 'feeding') return "/urwisek/jedzenie.webp";
    return "/urwisek/urwisek.webp"; 
  };

  const getSpeechBubble = () => {
    if (showSmile) return "Hura! Uwielbiam to! ✨";
    if (activeMode === 'washing') return "Pucujemy łuski! 🛁";
    if (activeMode === 'feeding') return "Mniam, moje ulubione! 🍕";
    if (activeMode === 'playing') return "Bawmy się! 🚀";
    
    if (state?.hunger < 30) return "Burczy mi w brzuchu... Daj coś zjeść! 🥺";
    if (state?.hygiene < 30) return "Chyba czas na kąpiel! 🧽";
    if (state?.happiness < 30) return "Pobaw się ze mną, nudzi mi się... 🧸";
    if (state?.hunger > 80 && state?.happiness > 80) return "Jestem taki szczęśliwy! Grajmy dalej! 🦖";
    
    return "Co dzisiaj robimy?";
  };

  return (
    <div className={`flex-1 flex flex-col items-center relative mt-4 mb-4 transition-all duration-500 ${activeMode === 'feeding' || activeMode === 'playing' ? 'justify-start pt-2' : 'justify-center'}`}>
      
      <AnimatePresence>
        {rewardMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 z-50 bg-urwis-blue text-white px-4 py-2 rounded-2xl font-black text-xs shadow-xl text-center"
          > 
            {rewardMessage} 
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-64 h-64 flex items-center justify-center z-10">
      <Image 
  id="urwisek-image" 
  src={getPetImageSrc()} 
  alt="Urwisek" 
  width={256} height={256} 
  className="object-contain drop-shadow-2xl transition-all duration-300 pointer-events-none" // pointer-events-none też tu pomoże!
  priority 
  draggable={false} // 👈 To blokuje systemowe przeciąganie obrazka
/>

        <AnimatePresence>
          {showSmile && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.3, opacity: 0.5 }} exit={{ opacity: 0 }} className="absolute z-20">
              <Sparkles className="w-48 h-48 text-yellow-400" />
            </motion.div>
          )}
          {!rewardMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 -right-8 md:-right-16 bg-white border-2 border-zinc-200 px-5 py-3 rounded-3xl rounded-bl-none shadow-xl z-40 max-w-[200px]"
            >
              <p className="text-sm font-black text-zinc-700 leading-tight italic">
                "{getSpeechBubble()}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mycie */}
        {activeMode === 'washing' && (
          <WashingGame onComplete={() => onActionComplete('wash')} />
        )}
      </div>

      {/* Karmienie na całej przestrzeni */}
      {activeMode === 'feeding' && (
        <FeedingGame onComplete={() => onActionComplete('feed')} />
      )}

      {/* Zabawa na całej przestrzeni */}
      {activeMode === 'playing' && (
        <PlayingGame onComplete={() => onActionComplete('play')} />
      )}

      {/* Nowoczesny przycisk wyjścia z gry */}
      <AnimatePresence>
        {activeMode !== 'none' && (
          <motion.button 
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveMode('none')} 
            className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-xl p-4 rounded-full text-urwis-red shadow-[0_10px_25px_-5px_rgba(191,32,36,0.3)] border-4 border-white z-50 transition-colors"
          >
            <X className="w-7 h-7 stroke-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}