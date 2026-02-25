'use client'

import { motion } from 'framer-motion';
import { Utensils, Droplets, Heart, Coins } from 'lucide-react';
import { getXPForLevel } from '@/lib/urwis/engine';
import { cn } from '@/lib/utils';

const StatBar = ({ icon: Icon, label, value, color, shadowColor }: any) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-center px-1 text-[9px] font-black uppercase text-gray-400 tracking-wider">
        <span className="flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</span>
      </div>
      <div className="h-2.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner p-[1.5px]">
        <motion.div 
          className={cn("h-full rounded-full transition-all duration-1000", color, shadowColor, "shadow-sm")} 
          initial={{ width: `${safeValue}%` }}
          animate={{ width: `${safeValue}%` }} 
        />
      </div>
    </div>
  );
};

export default function StatsSection({ state, activeMode }: { state: any, activeMode: string }) {
  const nextLvlXP = getXPForLevel(state.level);
  const xpPercentage = Math.min(100, (state.points_earned / nextLvlXP) * 100);

  return (
    <div className={cn(
      "space-y-3 z-30 relative transition-all duration-500 ease-in-out",
      // 🚀 KLUCZ: Jeśli trwa gra, panel ucieka 200px w górę i staje się przezroczysty
      activeMode !== 'none' && "opacity-0 -translate-y-48 pointer-events-none absolute top-0 left-0 right-0"
    )}>
      {/* Kapsuła z danymi gracza */}
      <div className="bg-white/80 backdrop-blur-xl p-3 px-4 rounded-[2rem] border-4 border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-urwis-blue to-blue-300 rounded-full p-0.5 shadow-lg shadow-blue-500/30">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-xl font-black text-urwis-blue">{state.level}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{state.playerName}</p>
            <h2 className="text-lg font-black text-gray-800 leading-none">{state.petName}</h2>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 bg-yellow-50 border-2 border-yellow-400 text-yellow-600 px-3 py-1 rounded-full text-xs font-black shadow-sm">
            <Coins className="w-4 h-4 text-yellow-500" /> {Math.floor(state.urwisCoins)}
          </div>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" 
              initial={{ width: `${xpPercentage}%` }}
              animate={{ width: `${xpPercentage}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Kapsuła z paskami potrzeb */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] border-4 border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] flex gap-4">
        <StatBar icon={Utensils} label="Głód" value={state.hunger} color="bg-urwis-red" shadowColor="shadow-red-500/50" />
        <StatBar icon={Droplets} label="Higiena" value={state.hygiene} color="bg-urwis-blue" shadowColor="shadow-blue-500/50" />
        <StatBar icon={Heart} label="Radość" value={state.happiness} color="bg-pink-500" shadowColor="shadow-pink-500/50" />
      </div>
    </div>
  );
}