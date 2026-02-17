'use client'
import { useState, useEffect } from 'react';
// ✅ ZMIANA: Używamy Twojego kontekstu
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Save, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Typy
type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

type WeeklySchedule = {
  [key: string]: DaySchedule;
};

const DAYS_MAP = {
  "1": "Poniedziałek",
  "2": "Wtorek",
  "3": "Środa",
  "4": "Czwartek",
  "5": "Piątek",
  "6": "Sobota",
  "0": "Niedziela",
};

export default function OpeningHoursEditor() {
  // ✅ ZMIANA: Pobieramy klienta z hooka
  const { supabase } = useSupabaseAuth();
  
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Jeśli supabase nie jest jeszcze gotowy, czekamy
    if (!supabase) return;
    
    fetchSettings();
  }, [supabase]);

  const fetchSettings = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'opening_hours')
      .single();

    if (data) {
      setSchedule(data.value);
    } else {
      // Opcjonalnie: Załaduj domyślne, jeśli baza jest pusta
      console.log("Brak ustawień w bazie lub błąd:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!schedule || !supabase) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'opening_hours', value: schedule });

    setSaving(false);
    if (!error) {
      alert('Zapisano godziny otwarcia! Zmiany pojawią się na stronie głównej.');
    } else {
      alert('Błąd zapisu! Sprawdź uprawnienia w Supabase.');
      console.error(error);
    }
  };

  const updateDay = (dayKey: string, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [field]: value
        }
      };
    });
  };

  if (loading) return <div className="p-4 text-zinc-500">Ładowanie ustawień...</div>;
  if (!schedule) return <div className="p-4 text-red-500">Błąd ładowania danych. Upewnij się, że tabela 'site_settings' istnieje w Supabase.</div>;

  // Kolejność wyświetlania (Pn-Nd)
  const sortedKeys = ["1", "2", "3", "4", "5", "6", "0"];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
          <Clock className="text-[#BF2024]" /> Godziny Otwarcia
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all shadow-lg text-sm uppercase tracking-wider"
        >
          <Save size={16} /> {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
        </motion.button>
      </div>

      <div className="space-y-3">
        {sortedKeys.map((dayKey) => {
          const day = schedule[dayKey];
          const isSunday = dayKey === "0";
          
          return (
            <div key={dayKey} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${day.closed ? 'bg-zinc-50 border-zinc-100 opacity-80' : 'bg-white border-blue-100 shadow-sm'}`}>
              <div className="w-32 font-bold text-zinc-700 flex flex-col">
                <span>{DAYS_MAP[dayKey as keyof typeof DAYS_MAP]}</span>
                {isSunday && !day.closed && (
                  <span className="text-[10px] text-green-600 font-black uppercase tracking-wider mt-1">Handlowa!</span>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-8">
                {/* Przełącznik Otwarte/Zamknięte */}
                <label className="flex items-center cursor-pointer relative group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!day.closed}
                    onChange={(e) => updateDay(dayKey, 'closed', !e.target.checked)}
                  />
                  <div className={`w-12 h-7 rounded-full peer transition-colors duration-300 ${!day.closed ? 'bg-green-500' : 'bg-zinc-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${!day.closed ? 'translate-x-5' : ''}`}></div>
                  <span className="ml-3 text-xs font-black uppercase tracking-wider text-zinc-500 min-w-[80px] group-hover:text-zinc-800 transition-colors">
                    {day.closed ? 'Zamknięte' : 'Otwarte'}
                  </span>
                </label>

                {/* Godziny */}
                <div className={`flex items-center gap-2 transition-opacity ${day.closed ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => updateDay(dayKey, 'open', e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 bg-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-zinc-400 font-bold">-</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => updateDay(dayKey, 'close', e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 bg-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-5 bg-orange-50 text-orange-800 text-sm rounded-2xl flex items-start gap-4 border border-orange-100">
        <AlertCircle className="shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-bold mb-1">Jak ustawić Niedzielę Handlową?</p>
          <p className="opacity-90">
            Domyślnie niedziele są zamknięte. Aby to zmienić, po prostu przesuń suwak przy "Niedziela" na <strong>Otwarte</strong> i ustaw godziny (np. 10:00 - 14:00). Status na stronie głównej zaktualizuje się automatycznie dla wszystkich klientów.
          </p>
        </div>
      </div>
    </div>
  );
}