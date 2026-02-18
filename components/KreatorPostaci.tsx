'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Brain, Zap, Heart, Shield, Sparkles, Check } from 'lucide-react'

const CLASSES = [
  { 
    id: 'bystrzak', 
    name: 'Bystrzak', 
    desc: 'Mistrz zagadek i technologii. Twoją bronią jest logika.',
    icon: Brain, 
    color: '#3b82f6',
    stats: { bystry_umysl: 8, energia: 4, serce: 3 }
  },
  { 
    id: 'silacz', 
    name: 'Strażnik', 
    desc: 'Niespożyta energia i siła. Zawsze w ruchu, zawsze pierwszy.',
    icon: Zap, 
    color: '#ef4444',
    stats: { bystry_umysl: 3, energia: 8, serce: 4 }
  },
  { 
    id: 'artysta', 
    name: 'Artysta', 
    desc: 'Kreatywność to Twoja supermoc. Widzisz to, czego inni nie widzą.',
    icon: Heart, 
    color: '#eab308',
    stats: { bystry_umysl: 4, energia: 3, serce: 8 }
  }
];

export default function KreatorPostaci({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleFinalize = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('profiles').update({
        bystry_umysl: selectedClass.stats.bystry_umysl,
        energia: selectedClass.stats.energia,
        serce: selectedClass.stats.serce,
        level: 1,
        xp: 0
      }).eq('id', user.id);
      
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#09090b] flex items-center justify-center p-6 overflow-hidden">
      {/* Tło energetyczne */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-xl text-center z-10"
          >
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Shield className="text-white" size={48} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-6 font-fredoka">
              Witaj w Akademii!
            </h1>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
              Przeszedłeś przez portal pomyślnie. Jesteś teraz w miejscu, gdzie Twoje pomysły stają się rzeczywistością. Zanim zaczniesz trening, musimy określić Twoje predyspozycje.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all"
            >
              Rozpocznij Test
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-5xl z-10"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black italic uppercase text-white font-fredoka">Wybierz swoją Drogę</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">To określi Twoje startowe moce</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CLASSES.map((cls) => (
                <div 
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`relative p-8 rounded-[3rem] border-2 transition-all cursor-pointer group ${selectedClass?.id === cls.id ? 'bg-white border-white' : 'bg-zinc-900/50 border-white/5 hover:border-white/20'}`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedClass?.id === cls.id ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <cls.icon size={32} />
                  </div>
                  <h3 className={`text-2xl font-black uppercase mb-3 font-fredoka ${selectedClass?.id === cls.id ? 'text-black' : 'text-white'}`}>
                    {cls.name}
                  </h3>
                  <p className={`text-sm font-medium leading-relaxed mb-6 ${selectedClass?.id === cls.id ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {cls.desc}
                  </p>
                  
                  {/* Statystyki podgląd */}
                  <div className="space-y-2">
                    <StatBar label="Umysł" val={cls.stats.bystry_umysl} active={selectedClass?.id === cls.id} />
                    <StatBar label="Energia" val={cls.stats.energia} active={selectedClass?.id === cls.id} />
                    <StatBar label="Serce" val={cls.stats.serce} active={selectedClass?.id === cls.id} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                disabled={!selectedClass || loading}
                onClick={handleFinalize}
                className="px-16 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-20 transition-all flex items-center gap-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Zatwierdź Wybór</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBar({ label, val, active }: { label: string, val: number, active: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-[10px] font-black uppercase ${active ? 'text-black' : 'text-zinc-600'}`}>{label}</span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(val / 10) * 100}%` }}
          className={`h-full ${active ? 'bg-black' : 'bg-zinc-500'}`}
        />
      </div>
    </div>
  )
}

function Loader2(props: any) {
  return <Zap {...props} className="animate-pulse" />
}