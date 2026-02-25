'use client'

import { motion } from 'framer-motion';
import { Utensils, Droplets, Heart, Coins, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getXPForLevel } from '@/lib/urwis/engine';

// ✅ KLUCZOWA POPRAWKA: Komponent StatBar wyciągnięty NA ZEWNĄTRZ!
// Dzięki temu React go nie niszczy przy każdym odliczeniu sekundy.
const StatBar = ({ icon: Icon, label, value, color }: any) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
        <span className="flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</span>
        <span>{Math.round(safeValue)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200/50">
        <motion.div 
          className={`h-full ${color}`} 
          // Ustawiamy pozycję początkową, aby zapobiec startowi od 100%
          initial={{ width: `${safeValue}%` }}
          animate={{ width: `${safeValue}%` }} 
          transition={{ ease: "linear", duration: 1 }} 
        />
      </div>
    </div>
  );
};

export default function StatsSection({ state }: { state: any }) {
  const nextLvlXP = getXPForLevel(state.level);
  const xpPercentage = Math.min(100, (state.points_earned / nextLvlXP) * 100);

  return (
    <div className="space-y-4 z-10 relative">
      <div className="bg-gray-50/80 p-3 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{state.playerName}</p>
            <h2 className="text-xl font-black text-gray-800 leading-none">{state.petName} <span className="text-[#bf2024]">Lvl {state.level}</span></h2>
          </div>
          <div className="flex gap-1">
            <div className="flex items-center gap-1 bg-white border-2 border-[#0055ff] text-[#0055ff] px-2 py-1 rounded-full text-[10px] font-black shadow-sm">
              <Coins className="w-3 h-3" /> {Math.floor(state.urwisCoins)}
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
           <motion.div 
             className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" 
             initial={{ width: `${xpPercentage}%` }}
             animate={{ width: `${xpPercentage}%` }} 
           />
        </div>
      </div>
      <Card className="p-4 bg-white border-2 border-gray-100 shadow-md rounded-2xl space-y-3">
        <StatBar icon={Utensils} label="Głód" value={state.hunger} color="bg-[#bf2024]" />
        <StatBar icon={Droplets} label="Higiena" value={state.hygiene} color="bg-[#0055ff]" />
        <StatBar icon={Heart} label="Radość" value={state.happiness} color="bg-pink-500" />
      </Card>
    </div>
  );
}