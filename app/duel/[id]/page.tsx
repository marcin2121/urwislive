'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Crown, Swords, Loader2, Trophy, ShieldCheck, Heart, ArrowLeft } from 'lucide-react'
import { GAME_ICONS, GAME_COMPONENTS } from '@/lib/game-registry'
import { toast } from 'sonner'
import Link from 'next/link'
import Particles from "@/components/Particles"

export default function UniversalDuelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const duelId = resolvedParams.id;
  const supabase = createClient();
  const router = useRouter();

  const [duel, setDuel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserId(user.id);

      // Pobieramy pojedynek wraz z danymi o typie gry z bazy
      const { data, error } = await supabase
        .from('duels')
        .select(`
          *,
          game_info:game_types(*),
          challenger:profiles!duels_challenger_id_fkey(*),
          defender:profiles!duels_defender_id_fkey(*)
        `)
        .eq('id', duelId)
        .single();

      if (error || !data) {
        toast.error("Nie znaleziono takiego pojedynku.");
        router.push('/');
        return;
      }

      setDuel(data);
      setLoading(false);
    }
    init();
  }, [duelId, router, supabase]);

  const handleFinish = async (results: { score: number, correct: number, time: number }) => {
    const isChallenger = userId === duel.challenger_id;
    
    // Logika aktualizacji punktów w zależności od tego, kto gra
    const updates = isChallenger ? {
      challenger_score: results.score,
      challenger_correct: results.correct,
      challenger_time_ms: results.time,
      status: 'in_progress'
    } : {
      defender_score: results.score,
      defender_correct: results.correct,
      defender_time_ms: results.time,
      status: 'completed',
      winner_id: results.score > duel.challenger_score ? userId : duel.challenger_id
    };

    const { error } = await supabase.from('duels').update(updates).eq('id', duelId);
    
    if (!error) {
      setGameState('finished');
      toast.success("Misja wykonana! Raport wysłany do centrali.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Łączenie z satelitą...</p>
    </div>
  );

  const gameInfo = duel.game_info;
  const Icon = GAME_ICONS[gameInfo.icon] || GAME_ICONS.Gamepad2;
  const GameEngine = GAME_COMPONENTS[duel.game_type];
  
  // Sprawdzenie czyja tura
  const isMyTurn = (userId === duel.challenger_id && duel.challenger_score === 0) || 
                   (userId === duel.defender_id && duel.defender_score === 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-28 pb-20 px-6 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-20">
        <Particles particleCount={30} particleColors={[gameInfo.theme_color]} />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto w-full space-y-8"
          >
            {/* LOBBY UI */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[4rem] p-12 relative overflow-hidden text-center">
              <div className="absolute top-0 inset-x-0 h-1.5" style={{ backgroundColor: gameInfo.theme_color }} />
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-12">
                <DuelParticipant profile={duel.challenger} score={duel.challenger_score} color={gameInfo.theme_color} label="Agresor" />
                <div className="flex flex-col items-center gap-2">
                  <Swords size={48} className="text-zinc-700 animate-pulse" />
                  <span className="text-4xl font-black italic opacity-20 tracking-tighter text-white">VS</span>
                </div>
                <DuelParticipant profile={duel.defender} score={duel.defender_score} color="#3f3f46" label="Obrońca" />
              </div>

              <div className="space-y-4 max-w-lg mx-auto mb-12">
                <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 text-white mb-4">
                   <Icon size={32} style={{ color: gameInfo.theme_color }} />
                </div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">{gameInfo.name}</h2>
                <p className="text-zinc-500 font-medium">{gameInfo.description}</p>
              </div>

              {isMyTurn ? (
                <button 
                  onClick={() => setGameState('playing')}
                  className="w-full md:w-auto px-16 py-6 bg-white text-zinc-950 rounded-full font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5"
                >
                  Rozpocznij Operację
                </button>
              ) : (
                <div className="p-6 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                   <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Oczekiwanie na ruch przeciwnika...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="engine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            {GameEngine ? (
              <GameEngine 
                seed={duel.questions_seed} 
                onComplete={handleFinish} 
                duelData={duel}
              />
            ) : (
              <div className="text-center py-20">Błąd: Nie znaleziono silnika gry.</div>
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center space-y-8">
            <div className="w-32 h-32 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <Trophy size={64} className="text-yellow-500 animate-bounce" />
            </div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">Raport Wysłany</h2>
            <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.3em]">Czekaj na finalny werdykt w powiadomieniach</p>
            <Link href="/" className="inline-block px-10 py-4 bg-zinc-900 border border-white/10 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-black transition-all">
              Powrót do Bazy
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DuelParticipant({ profile, score, color, label }: any) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{label}</p>
      <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-4 p-2 transition-all relative ${profile.is_premium ? 'shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ''}`} 
           style={{ borderColor: profile.is_premium ? '#eab308' : color }}>
        <img 
          src={`https://api.dicebear.com/7.x/${profile.avatar_style}/svg?seed=${profile.avatar_seed}`} 
          className="w-full h-full rounded-[2.5rem] bg-zinc-800" 
        />
        {profile.is_premium && (
          <div className="absolute -top-3 -right-3 bg-yellow-500 text-zinc-950 p-2 rounded-xl border-2 border-zinc-900 shadow-lg">
            <Crown size={14} />
          </div>
        )}
      </div>
      <div>
        <p className="text-xl font-black italic uppercase tracking-tighter">{profile.username}</p>
        <p className="text-2xl font-black text-white/40">{score > 0 ? score.toLocaleString() : '---'}</p>
      </div>
    </div>
  )
}