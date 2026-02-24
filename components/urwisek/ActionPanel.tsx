import { Utensils, Droplets, Heart, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActionPanel({ state, onAction, onModeChange, activeMode }: any) {
  const ActionButton = ({ icon: Icon, label, active, color, bgColor, onClick, subLabel }: any) => (
    <button onClick={active ? onClick : undefined} className={cn("flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300", active ? "hover:scale-105 active:scale-95" : "opacity-20 grayscale cursor-not-allowed")}>
      <div className={cn("p-3 rounded-xl shadow-sm", active ? bgColor : "bg-gray-100")}>
        <Icon className={cn("w-6 h-6", active ? color : "text-gray-400")} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-700 leading-none mt-1">{label}</span>
      <span className="text-[8px] font-bold text-gray-400">{subLabel}</span>
    </button>
  );

  return (
    <div className={cn("grid grid-cols-4 gap-2 bg-white p-3 rounded-3xl shadow-xl border border-gray-100 relative z-10 transition-opacity", activeMode !== 'none' && "opacity-30 pointer-events-none")}>
      <ActionButton 
        icon={Utensils} label="Karm" active={state.hunger < 80 && state.urwisCoins >= 40} 
        color="text-[#bf2024]" bgColor="bg-[#bf2024]/10" subLabel="-40 🪙" onClick={() => onModeChange('feeding')} 
      />
      <ActionButton 
        icon={Droplets} label="Myj" active={state.hygiene < 80} 
        color="text-[#0055ff]" bgColor="bg-[#0055ff]/10" subLabel="+20 🪙" onClick={() => onModeChange('washing')}
      />
      <ActionButton 
        icon={Heart} label="Graj" active={state.happiness < 80} 
        color="text-pink-500" bgColor="bg-pink-50" subLabel="+20 🪙" onClick={() => onAction('play')} 
      />
      <ActionButton icon={Trophy} label="Ranking" active={true} color="text-yellow-600" bgColor="bg-yellow-50" subLabel="Wyniki" onClick={() => {}} />
    </div>
  );
}