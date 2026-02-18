'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Trophy, Swords, Zap, Timer, Target, 
  Crown, ArrowLeft, Home, RotateCcw, 
  TrendingUp, Star, Loader2 
} from 'lucide-react'
import Particles from "@/components/Particles"
import MagicBento from '@/components/ui/MagicBento'

export default function DuelResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const duelId = resolvedParams.id;
  const supabase = createClient();
  const router = useRouter();

  const [duel, setDuel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data } = await supabase
        .from('duels')
        .select(`
          *,
          challenger:profiles!duels_challenger_id_fkey(*),
          defender:profiles!duels_defender_id_fkey(*)
        `)
        .eq('id', duelId)
        .single();

      if (data) setDuel(data);
      setLoading(false);
    }
    fetchData();
  }, [duelId, supabase]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-yellow-500" size={48} />
      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Generowanie raportu końcowego...</p>
    </div>
  );

  if (!duel) return <div className="text-white p-20 text-center">Błąd raportu. Misja nie istnieje.</div>;

  const isCompleted = duel.status === 'completed';
  const winnerId = duel.winner_id;
  const isWinner = userId === winnerId;
  const isDraw = duel.challenger_score === duel.defender_score && isCompleted;

  const challengerWin = winnerId === duel.challenger_id;
  const defenderWin = winnerId === duel.defender_id;

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-28 pb-20 px-4 md:px-8 relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 opacity-30">
        <Particles particleCount={50} particleColors={isWinner ? ["#eab308", "#ffffff"] : ["#3b82f6", "#ffffff"]} />
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* NAGŁÓWEK WYNIKU */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            {isWinner ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] mb-4">
                  <Trophy size={48} className="text-yellow-500 animate-bounce" />
                </div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-yellow-200 to-yellow-600">
                  Zwycięstwo!
                </h1>
              </div>
            ) : isCompleted ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-700 mb-4">
                  <Swords size={48} className="text-zinc-500" />
                </div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-zinc-500">
                  Misja Nieudana
                </h1>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-blue-500 animate-pulse">
                  Oczekiwanie...
                </h1>
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-4">Drugi Agent jeszcze nie zakończył tury</p>
              </div>
            )}
          </motion.div>
        </div>

        

        {/* PORÓWNANIE AGENTÓW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <div className="bg-zinc-950 p-4 rounded-full border border-white/10 shadow-2xl">
              <span className="text-2xl font-black italic text-zinc-700">VS</span>
            </div>
          </div>

          {/* CHALLENGER CARD */}
          <AgentResultCard 
            profile={duel.challenger} 
            score={duel.challenger_score} 
            correct={duel.challenger_correct} 
            time={duel.challenger_time_ms}
            isWinner={challengerWin}
            isMe={userId === duel.challenger_id}
          />

          {/* DEFENDER CARD */}
          <AgentResultCard 
            profile={duel.defender} 
            score={duel.defender_score} 
            correct={duel.defender_correct} 
            time={duel.defender_time_ms}
            isWinner={defenderWin}
            isMe={userId === duel.defender_id}
            isPending={duel.defender_score === 0}
          />
        </div>

        {/* ŁUPY (REWARDS) */}
        {isCompleted && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <MagicBento glowColor={isWinner ? "234, 179, 8" : "39, 39, 42"} className="bg-zinc-900/40 p-8 rounded-[3rem] border-white/5 text-center">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] mb-6">Zdobyte Łupy za Operację</h3>
              <div className="flex justify-center gap-12">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-yellow-500 text-3xl font-black">
                    <Zap size={24} /> {isWinner ? '+500' : '+0'}
                  </div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase">Kuleczki</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-500 text-3xl font-black">
                    <Star size={24} /> {isWinner ? '+200' : '+50'}
                  </div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase">Doświadczenie</p>
                </div>
              </div>
            </MagicBento>
          </motion.div>
        )}

        {/* AKCJE */}
        <div className="flex flex-col md:flex-row justify-center gap-4 pt-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-zinc-900 border border-white/10 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-black transition-all"
          >
            <Home size={18} /> Powrót do Bazy
          </button>
          <button 
            onClick={() => router.push('/profil/znajomi')}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs hover:scale-105 transition-all shadow-xl shadow-blue-900/20"
          >
            <RotateCcw size={18} /> Nowe Wyzwanie
          </button>
        </div>
      </div>
    </main>
  );
}

function AgentResultCard({ profile, score, correct, time, isWinner, isMe, isPending }: any) {
  return (
    <div className={`relative p-10 rounded-[4rem] border-2 transition-all overflow-hidden ${isWinner ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-zinc-900/40 border-white/5'}`}>
      {isWinner && (
        <div className="absolute top-6 right-8 text-yellow-500 animate-pulse">
          <Crown size={32} />
        </div>
      )}
      
      <div className="flex flex-col items-center gap-6">
        <div className={`w-32 h-32 rounded-[2.5rem] border-4 p-1 ${isWinner ? 'border-yellow-500' : 'border-zinc-800'}`}>
          <img 
            src={`https://api.dicebear.com/7.x/${profile.avatar_style}/svg?seed=${profile.avatar_seed}`} 
            className="w-full h-full rounded-[2.1rem] bg-zinc-800"
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">{profile.username}</h3>
            {isMe && <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-zinc-400 font-black uppercase">Ty</span>}
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{profile.status_tag}</p>
        </div>

        <div className="w-full grid grid-cols-3 gap-2 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Punkty</p>
            <p className={`text-lg font-black italic ${isWinner ? 'text-yellow-500' : 'text-white'}`}>
              {isPending ? '---' : score.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Poprawne</p>
            <p className="text-lg font-black italic">{isPending ? '---' : `${correct}/10`}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Czas</p>
            <p className="text-lg font-black italic">{isPending ? '---' : `${(time/1000).toFixed(1)}s`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}