'use client'

import { motion } from 'framer-motion';
import { Utensils, Droplets, Heart, LucideIcon } from 'lucide-react';
import { getXPForLevel } from '@/lib/urwis/engine';
import { cn } from '@/lib/utils';
import { UrwisPet } from '@/types/urwis';

interface StatBarProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  shadowColor: string;
}

const StatBar = ({ icon: Icon, label, value, color, shadowColor }: StatBarProps) => {
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

export default function StatsSection({ state, activeMode }: { state: UrwisPet, activeMode: string }) {
  const currentXP = Math.floor(state.points_earned);
  const targetXP = getXPForLevel(state.level);
  const xpPercentage = Math.min(100, (currentXP / targetXP) * 100);

  return (
    <div className={cn(
      "space-y-3 z-30 relative transition-all duration-500 ease-in-out",
      "mt-20 md:mt-16", // Mniejszy margines, by zmieścić się pod nowym headerem
      activeMode !== 'none' && "opacity-0 -translate-y-48 pointer-events-none absolute top-0 left-0 right-0"
    )}>
      
      {/* 🌟 KARTA GŁÓWNA: NICK I LVL */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] border-4 border-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-4 mb-4">
          {/* Duża Odznaka Levelu */}
          <div className="bg-urwis-blue p-1 rounded-2xl shadow-lg shadow-blue-200">
            <div className="bg-white px-4 py-1.5 rounded-[14px] flex flex-col items-center justify-center border-2 border-white">
              <span className="text-[10px] font-black text-urwis-blue uppercase leading-none">Poziom</span>
              <span className="text-2xl font-black text-urwis-blue leading-none">{state.level}</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{state.player_name}</p>
            <h2 className="text-2xl font-black text-gray-800 leading-none">{state.name}</h2>
          </div>
        </div>

        {/* 🏆 PASEK XP */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end px-1">
             <span className="text-[10px] font-black text-urwis-blue uppercase tracking-widest">Postęp do Lv.{state.level + 1}</span>
             <span className="text-xs font-black text-urwis-blue">
               {currentXP} <span className="text-gray-300">/</span> {targetXP} <span className="text-[10px]">XP</span>
             </span>
          </div>
          
          <div className="h-6 bg-gray-100 rounded-full border-2 border-white shadow-inner overflow-hidden relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500" 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1.5 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 🌟 POTRZEBY */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] border-4 border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] flex gap-4">
        <StatBar icon={Utensils} label="Głód" value={state.hunger_level} color="bg-urwis-red" shadowColor="shadow-red-500/50" />
        <StatBar icon={Droplets} label="Higiena" value={state.hygiene_level} color="bg-urwis-blue" shadowColor="shadow-blue-500/50" />
        <StatBar icon={Heart} label="Radość" value={state.happiness_level} color="bg-pink-500" shadowColor="shadow-pink-500/50" />
      </div>

    </div>
  );
}