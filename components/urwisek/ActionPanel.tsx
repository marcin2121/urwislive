import React, { useState } from 'react';
import { Utensils, Droplets, Heart, Trophy, ShoppingBag, Gamepad2, ScrollText, LayoutGrid, X, Coins, Medal, LucideIcon } from "lucide-react";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UrwisPet } from '@/types/urwis';

type GameMode = 'none' | 'washing' | 'feeding' | 'playing' | 'quests' | 'ranking' | 'shopping' | 'arcade' | 'achievements';

interface ActionPanelProps {
  state: UrwisPet;
  onModeChange: (mode: GameMode) => void;
  activeMode: GameMode;
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  color: string;
  bgColor: string;
  shadowColor: string;
  onClick: () => void;
  subLabel: React.ReactNode;
}

const ActionButton = ({ icon: Icon, label, active, color, bgColor, shadowColor, onClick, subLabel }: ActionButtonProps) => (
  <motion.button 
    whileTap={active ? { scale: 0.9 } : {}}
    onClick={active ? onClick : undefined} 
    className={cn(
      "flex flex-col items-center gap-1.5 p-2 transition-all duration-300 relative group min-w-[70px]", 
      active ? "cursor-pointer" : "opacity-40 grayscale cursor-not-allowed"
    )}
  >
    <div className={cn(
      "w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition-all duration-300 border-2 border-white",
      active ? `${bgColor} ${shadowColor} shadow-lg group-hover:-translate-y-1` : "bg-gray-100 shadow-inner border-transparent"
    )}>
      <Icon className={cn("w-7 h-7", active ? color : "text-gray-400")} strokeWidth={2.5} />
    </div>
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-black uppercase tracking-wide text-gray-700 leading-none">{label}</span>
      <span className={cn("text-[9px] font-black mt-0.5 flex items-center gap-0.5", active ? color : "text-gray-400")}>{subLabel}</span>
    </div>
  </motion.button>
);

export default function ActionPanel({ state, onModeChange, activeMode }: ActionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "relative z-10 transition-all duration-500 ease-in-out flex flex-col items-center", 
      activeMode !== 'none' && "opacity-0 translate-y-24 pointer-events-none absolute bottom-0 w-full"
    )}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 grid grid-cols-4 sm:grid-cols-4 xs:grid-cols-3 gap-2 bg-white/80 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,85,255,0.15)] border-4 border-white origin-bottom"
          >
            <ActionButton 
              icon={Utensils} label="Karm" active={state.hunger_level < 80 && state.urwis_coins >= 40} 
              color="text-[#bf2024]" bgColor="bg-red-50" shadowColor="shadow-red-500/30" 
              subLabel={<>-40 <Coins size={10} strokeWidth={3} /></>} 
              onClick={() => { onModeChange('feeding'); setIsOpen(false); }} 
            />
            <ActionButton 
              icon={Droplets} label="Myj" active={state.hygiene_level < 80} 
              color="text-[#0055ff]" bgColor="bg-blue-50" shadowColor="shadow-blue-500/30" 
              subLabel={<>+20 <Coins size={10} strokeWidth={3} /></>} 
              onClick={() => { onModeChange('washing'); setIsOpen(false); }}
            />
            <ActionButton 
              icon={Heart} label="Graj" active={state.happiness_level < 80} 
              color="text-pink-500" bgColor="bg-pink-50" shadowColor="shadow-pink-500/30" 
              subLabel={<>+20 <Coins size={10} strokeWidth={3} /></>} 
              onClick={() => { onModeChange('playing'); setIsOpen(false); }} 
            />
            <ActionButton 
              icon={ScrollText} label="Misje" active={true} 
              color="text-orange-500" bgColor="bg-orange-50" shadowColor="shadow-orange-500/30" 
              subLabel="Questy" 
              onClick={() => { onModeChange('quests'); setIsOpen(false); }} 
            />
            <ActionButton 
              icon={Trophy} label="Ranking" active={true} 
              color="text-yellow-500" bgColor="bg-yellow-50" shadowColor="shadow-yellow-500/30" 
              subLabel="Wyniki" 
              onClick={() => { onModeChange('ranking'); setIsOpen(false); }} 
            />
            <ActionButton 
              icon={ShoppingBag} label="Sklep" active={true} 
              color="text-emerald-500" bgColor="bg-emerald-50" shadowColor="shadow-emerald-500/30" 
              subLabel="Itemy" 
              onClick={() => { onModeChange('shopping'); setIsOpen(false); }} 
            />
            <ActionButton 
              icon={Gamepad2} label="Gry" active={true} 
              color="text-purple-500" bgColor="bg-purple-50" shadowColor="shadow-purple-500/30" 
              subLabel="Arcade" 
              onClick={() => { onModeChange('arcade'); setIsOpen(false); }} 
            />
            <ActionButton 
              icon={Medal} label="Odznaki" active={true} 
              color="text-amber-500" bgColor="bg-amber-50" shadowColor="shadow-amber-500/30" 
              subLabel="Gablota" 
              onClick={() => { onModeChange('achievements'); setIsOpen(false); }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Główny przycisk otwierający menu */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Zamknij panel akcji" : "Otwórz panel akcji z Urwisem"}
        className={cn(
          "w-16 h-16 rounded-[1.6rem] flex items-center justify-center border-4 border-white shadow-xl z-20 transition-all duration-300",
          isOpen ? "bg-gray-100 text-gray-500 shadow-none border-gray-200" : "bg-urwis-blue text-white shadow-blue-500/40 hover:bg-blue-600 hover:-translate-y-1"
        )}
      >
        {isOpen ? <X size={32} strokeWidth={2.5} /> : <LayoutGrid size={32} strokeWidth={2.5} />}
      </motion.button>
    </div>
  );
}