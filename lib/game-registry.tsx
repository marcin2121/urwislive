import React from 'react';
import { Brain, Cpu, Target, Gamepad2, type LucideIcon } from 'lucide-react';

// IMPORTY SILNIKÓW GIER
// Tutaj importujemy komponenty, które stworzyliśmy (lub stworzymy)
import QuizDuelEngine from '@/components/games/QuizDuelEngine';

/**
 * REJESTR IKON
 * Mapujemy nazwy tekstowe z bazy danych (tabela game_types, kolumna icon)
 * na rzeczywiste komponenty Lucide React.
 */
export const GAME_ICONS: Record<string, LucideIcon> = {
  Brain,
  Cpu,
  Target,
  Gamepad2
};

/**
 * REJESTR KOMPONENTÓW GIER
 * Mapujemy ID gry z bazy danych (tabela game_types, kolumna id)
 * na komponenty silników gier.
 */
export const GAME_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Główne wyzwanie wiedzy
  quiz: QuizDuelEngine,

  // PLACEHOLDER DLA NADCHODZĄCYCH GIER
  // Możesz tu wstawić tymczasowe komponenty, dopóki nie napiszemy pełnego kodu
  memory: (props: any) => (
    <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 rounded-[3rem] border border-dashed border-white/10">
      <Cpu size={48} className="text-purple-500/20 mb-4 animate-pulse" />
      <h3 className="text-xl font-black uppercase italic text-zinc-500">Operacja: Szyfrator</h3>
      <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2">
        Silnik w trakcie kalibracji...
      </p>
      <button 
        onClick={() => props.onComplete({ score: 0, correct: 0, time: 0 })}
        className="mt-8 px-6 py-2 text-[10px] font-black uppercase bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
      >
        Anuluj Misję
      </button>
    </div>
  ),

  reflex: (props: any) => (
    <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 rounded-[3rem] border border-dashed border-white/10">
      <Target size={48} className="text-red-500/20 mb-4 animate-pulse" />
      <h3 className="text-xl font-black uppercase italic text-zinc-500">Szybki Strzał</h3>
      <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2">
        Zbrojownia jest obecnie zamknięta.
      </p>
    </div>
  ),
};

/**
 * FUNKCJA POMOCNICZA
 * Pozwala bezpiecznie pobrać ikonę lub zwrócić domyślną (Gamepad2),
 * jeśli w bazie wpisano nieistniejącą nazwę.
 */
export const getGameIcon = (iconName: string | null) => {
  return GAME_ICONS[iconName as string] || Gamepad2;
};