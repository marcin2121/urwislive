'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Trophy, Timer, RefreshCcw, CheckCircle2, XCircle, 
  Home, Loader2, AlertCircle, Star, Zap, Target, Crown, User as UserIcon, ArrowUp
} from 'lucide-react'
import Particles from "@/components/Particles"
import confetti from 'canvas-confetti'

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  exp: number;
  category: string;
  difficulty: string;
}

export default function SinglePlayerQuiz() {
  const supabase = createClient();
  const router = useRouter();

  // --- STANY GRY ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [saving, setSaving] = useState(false);
  const [ranking, setRanking] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);

  // --- WYNIKI ---
  const [score, setScore] = useState(0);
  const [finalBigScore, setFinalBigScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  // --- CZAS ---
  const [startTime, setStartTime] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePoints = (correct: number, timeMs: number) => {
    const basePoints = correct * 10000;
    const timeInSeconds = timeMs / 1000;
    const timeFactor = Math.max(0.1, 1 - (timeInSeconds / 300));
    return Math.floor(basePoints * timeFactor);
  };

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data, error } = await supabase
          .from('trivia_questions')
          .select('*')
          .eq('is_active', true) 
          .limit(50);
  
        if (error) throw error;
        if (data && data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
          setQuestions(shuffled);
          setGameStatus('playing');
          setStartTime(Date.now());
        } else {
          setError("Baza pytań jest pusta.");
        }
      } catch (err: any) {
        setError(`Błąd: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [supabase]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      setTimeLeft(15);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [currentQ, gameStatus]);

  const handleAnswer = (index: number) => {
    clearInterval(timerRef.current as NodeJS.Timeout);
    if (selected !== null) return;

    setSelected(index);
    const isAnsCorrect = index === questions[currentQ].correct;

    if (isAnsCorrect) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
      } else {
        const duration = Date.now() - startTime;
        setTotalTimeMs(duration);
        completeGame(isAnsCorrect ? score + 1 : score, duration);
      }
    }, 1200);
  };

  const completeGame = async (finalCorrect: number, duration: number) => {
    setGameStatus('finished');
    const bigScore = calculatePoints(finalCorrect, duration);
    setFinalBigScore(bigScore);

    if (finalCorrect >= 7) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#0055ff', '#BF2024'] });
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Zapisz wynik
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          correct_answers: finalCorrect,
          total_time_ms: duration,
        });

        // 2. Nagrody
        await supabase.rpc('increment_loyalty_points', { 
          uid: user.id, 
          inc_kuleczki: Math.floor(bigScore / 10000), 
          inc_exp: finalCorrect * 50 
        });

        // 3. Pobierz TOP 3
        const { data: topData } = await supabase
          .from('quiz_results')
          .select(`correct_answers, total_time_ms, profiles(username, avatar_url)`)
          .order('correct_answers', { ascending: false })
          .order('total_time_ms', { ascending: true })
          .limit(3);

        // 4. Oblicz miejsce (Rank)
        const { count: betterResults } = await supabase
          .from('quiz_results')
          .select('*', { count: 'exact', head: true })
          .or(`correct_answers.gt.${finalCorrect},and(correct_answers.eq.${finalCorrect},total_time_ms.lt.${duration})`);

        setCurrentUserRank((betterResults || 0) + 1);

        if (topData) {
          const formatted = topData.map((r: any) => ({
            username: r.profiles?.username || 'Anonim',
            avatar: r.profiles?.avatar_url,
            score: calculatePoints(r.correct_answers, r.total_time_ms)
          }));
          setRanking(formatted);
        }
      }
    } catch (err) {
      console.error("Błąd zapisu:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (gameStatus === 'finished') {
      let start = 0;
      const duration = 2000;
      const increment = finalBigScore / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= finalBigScore) {
          setAnimatedScore(finalBigScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [gameStatus, finalBigScore]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-x-hidden flex flex-col items-center justify-start pt-38 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={40} particleColors={["#0055ff", "#BF2024"]} alphaParticles speed={0.1} />
      </div>

      <AnimatePresence mode="wait">
        {gameStatus === 'playing' ? (
          <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl mt-12">
            <div className="flex justify-between items-end mb-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Kategoria</div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-white font-bold text-sm backdrop-blur-md">{questions[currentQ].category}</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Czas</div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-md transition-colors ${timeLeft < 5 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
                  <Timer size={16} /> <span className="font-black text-xl tabular-nums">{timeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="w-full h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden">
              <motion.div className="h-full bg-linear-to-r from-blue-600 to-purple-500" initial={{ width: "0%" }} animate={{ width: `${(currentQ / questions.length) * 100}%` }} />
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-3xl text-center">
               <h2 className="text-2xl md:text-4xl font-black text-white italic leading-tight mb-10 tracking-tight">{questions[currentQ].question}</h2>
               <div className="grid gap-3">
                 {questions[currentQ].options.map((opt, idx) => {
                   const isSelected = selected === idx;
                   const isCorrect = idx === questions[currentQ].correct;
                   const showResult = selected !== null;
                   return (
                     <button key={idx} onClick={() => handleAnswer(idx)} disabled={showResult} className={`w-full p-5 rounded-2xl border-2 font-bold text-lg transition-all duration-300 flex justify-between items-center group ${!showResult ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-zinc-300' : ''} ${showResult && isCorrect ? 'bg-green-500/20 border-green-500 text-green-400' : ''} ${showResult && isSelected && !isCorrect ? 'bg-red-500/20 border-red-500 text-red-400' : ''} ${showResult && !isSelected && !isCorrect ? 'opacity-30 border-transparent text-zinc-600' : ''}`}>
                       <span className="group-hover:translate-x-1 transition-transform">{opt}</span>
                       {showResult && isCorrect && <CheckCircle2 size={24} />}
                       {showResult && isSelected && !isCorrect && <XCircle size={24} />}
                     </button>
                   );
                 })}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl text-center space-y-12">
            <div className="space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-pulse" />
                <div className="bg-zinc-900 border-2 border-yellow-500/50 p-6 rounded-[2.5rem] relative z-10 shadow-2xl">
                  <Trophy size={60} className="text-yellow-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-zinc-500 font-black uppercase tracking-[0.4em] text-xs">Misja Zakończona</h3>
                <div className="text-7xl md:text-[9rem] font-black text-white italic leading-none tracking-tighter">{animatedScore.toLocaleString()}</div>
                <p className="text-xl md:text-2xl font-bold text-yellow-500 uppercase tracking-widest">Punktów Agenta</p>
              </div>
            </div>

            {/* STATYSTYKI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl group">
                <Star className="text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                <div className="text-3xl font-black text-white">{score}/10</div>
                <div className="text-[11px] uppercase font-black text-zinc-500 tracking-widest mt-1">Poprawne</div>
              </div>
              <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl group">
                <Zap className="text-blue-400 mx-auto mb-3 fill-blue-400 group-hover:scale-110 transition-transform" size={32} />
                <div className="text-3xl font-black text-white">{(totalTimeMs / 1000).toFixed(2)}s</div>
                <div className="text-[11px] uppercase font-black text-zinc-500 tracking-widest mt-1">Twój Czas</div>
              </div>
              <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl group">
                <Target className="text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" size={32} />
                <div className="text-3xl font-black text-white">+{Math.floor(finalBigScore / 10000)}</div>
                <div className="text-[11px] uppercase font-black text-zinc-500 tracking-widest mt-1">Kuleczki</div>
              </div>
            </div>

            {/* RANKING LIVE */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-2xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between px-8">
                <h4 className="text-white font-black uppercase italic flex items-center gap-2 text-sm">
                  <Crown size={18} className="text-yellow-500" /> Ranking Agenta
                </h4>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Twoja Pozycja: #{currentUserRank || '--'}</div>
              </div>
              
              <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-4 md:p-8 space-y-3 relative overflow-hidden">
                {ranking.length > 0 ? (
                  <>
                    {ranking.map((player, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${idx === 0 ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`font-black italic w-6 text-lg ${idx === 0 ? 'text-yellow-400' : 'text-zinc-600'}`}>#{idx + 1}</span>
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                            {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserIcon size={16} className="text-zinc-600" /></div>}
                          </div>
                          <span className="text-white font-bold text-sm truncate max-w-[120px] md:max-w-none">{player.username}</span>
                        </div>
                        <span className={`font-black italic ${idx === 0 ? 'text-yellow-400' : 'text-white'}`}>{player.score.toLocaleString()}</span>
                      </div>
                    ))}

                    {currentUserRank > 3 && (
                      <div className="flex flex-col items-center gap-1 py-2 opacity-30">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                    )}

                    {currentUserRank > 3 && (
                      <div className="flex items-center justify-between p-5 bg-blue-500/10 rounded-2xl border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <div className="flex items-center gap-4 text-left">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-blue-400 font-black italic text-xl">#{currentUserRank}</span>
                            <span className="text-[8px] font-black text-blue-500 uppercase">TY</span>
                          </div>
                          <div className="ml-2">
                             <span className="text-white font-black uppercase text-sm block">Twój Wynik</span>
                             <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase">
                               <ArrowUp size={12} /> Brakuje Ci {(ranking[2].score - finalBigScore).toLocaleString()} pkt do Top 3!
                             </div>
                          </div>
                        </div>
                        <div className="text-right">
                            <span className="text-blue-400 font-black italic text-2xl">{finalBigScore.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 size={32} className="animate-spin text-zinc-800" />
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8 pb-12">
              <button onClick={() => window.location.reload()} className="w-full md:w-auto px-12 py-5 bg-white text-zinc-950 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"><RefreshCcw size={20} className="inline mr-2" /> Zagraj ponownie</button>
              <button onClick={() => router.push('/profil')} className="w-full md:w-auto px-12 py-5 bg-zinc-900 border border-white/10 text-zinc-500 rounded-full font-black uppercase tracking-widest hover:text-white transition-colors"><Home size={20} className="inline mr-2" /> Powrót do bazy</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
      <div className="text-xs font-black text-white uppercase tracking-widest animate-pulse">Ładowanie misji...</div>
    </main>
  )
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-black text-white uppercase mb-2">Błąd Systemu</h2>
      <p className="text-zinc-500 mb-8">{error}</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white rounded-full font-black uppercase text-sm">Odśwież</button>
    </main>
  )
}