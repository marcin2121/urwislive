'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, X, Star } from 'lucide-react'

export default function RankingModal({ isOpen, onClose, ranking }: { 
  isOpen: boolean, 
  onClose: () => void, 
  ranking: any[] 
}) {
  if (!isOpen) return null

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md h-[80vh] flex flex-col overflow-hidden shadow-2xl border-t-8 border-yellow-400"
      >
        {/* Nagłówek */}
        <div className="p-6 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Najlepsze Urwisy</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {ranking.map((player, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${
                index === 0 ? 'bg-yellow-50 border-yellow-200 scale-[1.02] shadow-md' : 
                index === 1 ? 'bg-gray-50 border-gray-200' :
                index === 2 ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Miejsce w rankingu */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-yellow-400 text-white shadow-lg' : 
                  index === 1 ? 'bg-gray-300 text-white' :
                  index === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {index + 1}
                </div>

                <div>
                  <p className="font-black text-gray-800 leading-none">{player.player_name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Urwis: {player.name}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 text-urwis-blue fill-urwis-blue" />
                  <span className="text-lg font-black text-urwis-blue">Lvl {player.level}</span>
                </div>
                <p className="text-[9px] font-bold text-gray-300 uppercase">{player.points_earned} XP</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-gray-50 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Ranking odświeża się na żywo 🚀</p>
        </div>
      </motion.div>
    </motion.div>
  )
}