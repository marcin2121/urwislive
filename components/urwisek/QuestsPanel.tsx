'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, X, CheckCircle, Gift, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestsPanelProps {
  completedQuests: string[]
  questProgress: Record<string, number>
  onClose: () => void
  onClaim: (questId: string, reward: number) => void
}

// Baza przykładowych zadań dziennych
const DAILY_QUESTS = [
  { id: 'q_feed_3', title: 'Wielki Głód', desc: 'Nakarm Urwiska 3 razy', reward: 100, target: 3 },
  { id: 'q_play', title: 'Czas na Zabawę', desc: 'Pobaw się ze zwierzakiem', reward: 50, target: 1 },
  { id: 'q_shop_2', title: 'Mały Kupiec', desc: 'Kup 2 przedmioty w Sklepie', reward: 150, target: 2 },
  { id: 'q_wash_3', title: 'Czysty Urwis', desc: 'Umyj Urwiska 3 razy', reward: 100, target: 3 },
  { id: 'q_arcade_2', title: 'Mistrz Arcade', desc: 'Zagraj 2 razy w minigrę', reward: 120, target: 2 },
];

export default function QuestsPanel({ completedQuests, questProgress = {}, onClose, onClaim }: QuestsPanelProps) {

  const handleClaim = (id: string, reward: number) => {
    if (completedQuests.includes(id)) return
    
    // Odbierz nagrodę (zaktualizuje stan w nadrzędnym)
    onClaim(id, reward)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-6 flex flex-col border-4 border-orange-100 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600 shadow-sm border border-orange-200/50">
            <ScrollText size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter italic uppercase leading-none">Misje</h2>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              Tablica Ogłoszeń
            </p>
          </div>
        </div>
        <button onClick={onClose} className="bg-zinc-50 p-2.5 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer border border-zinc-200">
           <X size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative content-start z-10 space-y-3 pb-8 pr-2 scrollbar-thin scrollbar-thumb-orange-200">
        <p className="text-xs font-bold text-center text-zinc-400 mb-4 px-4 uppercase tracking-widest">Wypełniaj cele grając w stworka by otrzymać wypłatę</p>
        
        {DAILY_QUESTS.map(quest => {
          const isCompleted = completedQuests.includes(quest.id)
          const currentProgress = Math.min((questProgress || {})[quest.id] || 0, quest.target)
          const isClaimable = currentProgress >= quest.target && !isCompleted
          const percentage = (currentProgress / quest.target) * 100
          
          return (
            <div key={quest.id} className={cn(
              "w-full bg-white border-2 p-4 rounded-3xl flex items-center gap-4 group transition-all relative overflow-hidden",
              isCompleted ? "border-green-200 opacity-70" : "border-zinc-200 hover:border-orange-400"
            )}>
              {/* Odhaczenie tła po zrobieniu */}
              {isCompleted && (
                 <div className="absolute inset-0 bg-green-50/50 pointer-events-none" />
              )}
              
              <div className={cn(
                "p-3 rounded-2xl transition-transform",
                isCompleted ? "bg-green-100 text-green-500" : "bg-orange-50 text-orange-500 group-hover:scale-110"
              )}>
                {isCompleted ? <CheckCircle size={28} /> : <Gift size={28} />}
              </div>
              <div className="text-left flex-1 relative z-10">
                <h3 className={cn("font-black text-lg leading-none mb-1", isCompleted ? "text-green-700" : "text-zinc-800")}>
                  {quest.title}
                </h3>
                <p className="text-xs font-bold text-zinc-400 mb-2">{quest.desc}</p>
                
                {/* Wskaźnik postępu (ProgressBar) */}
                {quest.target > 1 && (
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 mb-1">
                       <span>Postęp</span>
                       <span>{currentProgress} / {quest.target}</span>
                    </div>
                    <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleClaim(quest.id, quest.reward)}
                disabled={!isClaimable}
                className={cn(
                  "font-black px-4 py-2 rounded-xl uppercase tracking-widest text-[10px] sm:text-xs transition-colors relative z-10 flex flex-col sm:flex-row items-center justify-center min-w-[80px]",
                  isCompleted ? "bg-green-100 text-green-600 border border-green-200 cursor-not-allowed" : 
                  isClaimable ? "bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20" :
                  "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {isCompleted ? 'Zrobione' : 
                 !isClaimable ? <><span className="mt-[2px]">{quest.reward}</span> <Coins size={12} strokeWidth={2.5} className="sm:ml-1" /></> :
                 <><span className="mt-[2px]">Odbierz</span> <Coins size={14} strokeWidth={2.5} className="sm:ml-1"/></>}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
