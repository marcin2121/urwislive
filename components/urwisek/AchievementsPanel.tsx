import React from 'react';
import { motion } from 'framer-motion';
import { Medal, X, Lock } from 'lucide-react';
import { URWIS_ACHIEVEMENTS } from '@/lib/urwis/achievements';
import { cn } from '@/lib/utils';

interface AchievementsPanelProps {
  unlockedIds: string[];
  totalPoints: number;
  onClose: () => void;
}

export default function AchievementsPanel({ unlockedIds, totalPoints, onClose }: AchievementsPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-6 flex flex-col border-4 border-amber-100 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600 shadow-sm border border-amber-200/50">
            <Medal size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-900 tracking-tighter italic uppercase leading-none">Gablotka</h2>
            <p className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
              Odznaki: {totalPoints} PKT
            </p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Zamknij gablotkę" className="bg-zinc-50 p-2.5 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer border border-zinc-200">
           <X size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full mx-auto relative content-start z-10 space-y-3 custom-scrollbar pr-2">
        {URWIS_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);

          return (
            <div 
              key={ach.id}
              className={cn(
                "relative p-4 rounded-3xl border-2 flex items-center gap-4 transition-all duration-300 overflow-hidden group",
                isUnlocked 
                  ? "bg-amber-50 border-amber-200 shadow-md shadow-amber-500/10" 
                  : "bg-zinc-50 border-zinc-200 grayscale opacity-70"
              )}
            >
              {/* Ikona */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-inner",
                isUnlocked ? "bg-amber-400 border-amber-300 text-white" : "bg-zinc-200 border-zinc-300 text-zinc-400"
              )}>
                {isUnlocked ? <Medal size={24} strokeWidth={2.5} /> : <Lock size={20} />}
              </div>

              {/* Tekst */}
              <div className="flex-1">
                <h3 className={cn(
                  "font-black text-lg leading-none tracking-tight mb-1 content-center",
                  isUnlocked ? "text-amber-900" : "text-zinc-500"
                )}>
                  {ach.title}
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-snug">
                  {ach.description}
                </p>
              </div>

              {/* Punkty */}
              <div className={cn(
                "font-black px-3 py-1.5 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1",
                isUnlocked ? "bg-amber-100 text-amber-700" : "bg-zinc-200 text-zinc-500"
              )}>
                +{ach.points} PKT
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
