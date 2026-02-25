import { Utensils, Droplets, Heart, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ActionPanel({ state, onAction, onModeChange, activeMode }: any) {
  const ActionButton = ({ icon: Icon, label, active, color, bgColor, shadowColor, onClick, subLabel }: any) => (
    <motion.button 
      whileTap={active ? { scale: 0.9 } : {}} // Efekt wciskania żelka
      onClick={active ? onClick : undefined} 
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 transition-all duration-300 relative group", 
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
        <span className={cn("text-[9px] font-black mt-0.5", active ? color : "text-gray-400")}>{subLabel}</span>
      </div>
    </motion.button>
  );

  return (
    // Panel chowa się (translate-y-24 opacity-0), gdy włączamy jakąkolwiek grę!
    <div className={cn(
      "flex justify-around bg-white/70 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,85,255,0.15)] border-4 border-white relative z-10 transition-all duration-500 ease-in-out", 
      activeMode !== 'none' && "opacity-0 translate-y-24 pointer-events-none absolute bottom-0 w-full"
    )}>
      <ActionButton 
        icon={Utensils} label="Karm" active={state.hunger < 80 && state.urwisCoins >= 40} 
        color="text-[#bf2024]" bgColor="bg-red-50" shadowColor="shadow-red-500/30" subLabel="-40 🪙" onClick={() => onModeChange('feeding')} 
      />
      <ActionButton 
        icon={Droplets} label="Myj" active={state.hygiene < 80} 
        color="text-[#0055ff]" bgColor="bg-blue-50" shadowColor="shadow-blue-500/30" subLabel="+20 🪙" onClick={() => onModeChange('washing')}
      />
      <ActionButton 
        icon={Heart} label="Graj" active={state.happiness < 80} 
        color="text-pink-500" bgColor="bg-pink-50" shadowColor="shadow-pink-500/30" subLabel="+20 🪙" onClick={() => onModeChange('playing')} 
      />
<ActionButton 
        icon={Trophy} label="Ranking" active={true} 
        color="text-yellow-500" bgColor="bg-yellow-50" shadowColor="shadow-yellow-500/30" subLabel="Wyniki" 
        onClick={() => onModeChange('ranking')} // 👈 ZMIENIONO TUTAJ
      />
    </div>
  );
}