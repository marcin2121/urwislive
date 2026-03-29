'use client'

import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, Check, Lock, Star, Crown, Pizza, Image as ImageIcon, Dog, Coins } from 'lucide-react'
import Image from 'next/image'
import { SHOP_ITEMS, UrwisItem } from '@/lib/urwis/items'
import { cn } from '@/lib/utils'

interface ShopProps {
  coins: number
  level: number
  inventory: string[]
  equippedItems: Record<string, string>
  onClose: () => void
  onBuy: (itemId: string) => void
  onEquipToggle: (itemId: string, category: string) => void
}

export default function UrwisShop({ coins, level, inventory, equippedItems, onClose, onBuy, onEquipToggle }: ShopProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'hat' | 'toy'>('all')
  const [isPending, startTransition] = useTransition()

  const handleAction = (item: UrwisItem) => {
    startTransition(() => {
      const isOwned = inventory.includes(item.id)
      
      if (!isOwned && coins >= item.price && level >= item.requiredLevel) {
        onBuy(item.id) // Odbierz z bazy (kup) 
      } else if (isOwned) {
        onEquipToggle(item.id, item.category) // ubierz/zdejmij nakladke
      }
    })
  }

  const filteredItems = activeTab === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === activeTab)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-6 flex flex-col border-4 border-white overflow-hidden"
    >
      
      {/* HEADER SKLEPU */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2.5 rounded-2xl text-yellow-600 shadow-sm border border-yellow-200/50">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter italic uppercase leading-none">Sklepik</h2>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" /> Masz {coins} <Coins className="inline-block w-3 h-3 text-yellow-500" />
            </p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Zamknij sklep" className="bg-red-50 p-2.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer border border-red-100">
           <X size={24} strokeWidth={3} />
        </button>
      </div>

      {/* TABS KATEGORII */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none px-2">
         {['all', 'hat', 'toy'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as 'all' | 'hat' | 'toy')}
             className={cn(
               "px-4 py-2.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all whitespace-nowrap border-2 flex items-center gap-2",
               activeTab === tab ? "bg-zinc-900 text-white border-zinc-900 shadow-md" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
             )}
           >
             {tab === 'all' && <ShoppingBag size={14} />}
             {tab === 'hat' && <Crown size={14} />}
             {tab === 'toy' && <Dog size={14} />}
             {tab === 'all' ? 'Wszystko' : tab === 'hat' ? 'Czapki' : 'Zwierzaki'}
           </button>
         ))}
      </div>

      {/* LISTA PRZEDMIOTÓW (GRID) */}
      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-8 pr-2 content-start scrollbar-thin scrollbar-thumb-zinc-200">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const isOwned = inventory.includes(item.id)
            const isEquipped = equippedItems[item.category] === item.id
            const matchesLevel = level >= item.requiredLevel
            const canAfford = coins >= item.price

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={item.id}
                className={cn(
                  "relative bg-white rounded-[2rem] p-4 flex flex-col items-center justify-between text-center border-2 shadow-sm transition-all h-[240px]",
                  isEquipped ? "border-green-400 shadow-green-100" : "border-zinc-100 hover:border-zinc-300"
                )}
              >
                {/* Oznaka noszenia */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm z-10">
                    Założone
                  </div>
                )}
                
                {/* Kłódka z poziomem */}
                {!matchesLevel && !isOwned && (
                  <div className="absolute top-2 left-2 bg-zinc-800 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm z-10 flex items-center gap-1">
                    <Lock size={10} /> Lvl {item.requiredLevel}
                  </div>
                )}
                
                {/* Wizerunek / IKONA */}
                <div className="w-16 h-16 relative flex items-center justify-center bg-zinc-50 rounded-2xl mb-2 mt-4">
                   <Image 
                      src={item.imageSrc} 
                      alt={item.name} 
                      fill 
                      sizes="64px"
                      style={{ objectFit: 'contain' }} 
                      className="p-2 drop-shadow-md" 
                   />
                </div>

                {/* Opisy */}
                <div className="mb-2">
                  <h3 className="font-black text-sm text-zinc-800 leading-tight mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] text-zinc-400 font-medium leading-tight line-clamp-2">{item.description}</p>
                </div>

                {/* Przycisk akcji (KUP/NAŁÓŻ) */}
                <button
                  disabled={isPending || (!isOwned && (!canAfford || !matchesLevel))}
                  onClick={() => handleAction(item)}
                  className={cn(
                    "w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all outline-none mt-auto",
                    isEquipped ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200" :
                    isOwned ? "bg-urwis-blue text-white shadow-md shadow-blue-500/20 hover:bg-blue-600" :
                    matchesLevel && canAfford ? "bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-400/20 hover:bg-yellow-500" :
                    "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isPending ? (
                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isEquipped ? (
                    'Zdejmij'
                  ) : isOwned ? (
                    'Załóż'
                  ) : !matchesLevel ? (
                    <><Lock size={12} /> Lvl {item.requiredLevel}</>
                  ) : canAfford ? (
                    <span className="flex items-center justify-center gap-1">Kup: {item.price} <Coins className="w-3 h-3 text-yellow-500" /></span>
                  ) : (
                    <span className="flex items-center justify-center gap-1"><Lock size={12} /> Brak <Coins className="w-3 h-3 text-yellow-500" /></span>
                  )}
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

    </motion.div>
  )
}
