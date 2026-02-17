'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Trophy, Timer, RefreshCcw, CheckCircle2, XCircle, 
  BrainCircuit, Home, Loader2, AlertCircle, Star 
} from 'lucide-react'
import Particles from "@/components/Particles"
import confetti from 'canvas-confetti'

// ✅ Typ zgodny z Twoim plikiem CSV
interface Question {
  id: number;
  question: string;
  options: string[]; // Supabase zwróci to jako tablicę
  correct: number;   // W Twojej bazie to 'correct', nie 'correct_answer'
  exp: number;       // Punkty doświadczenia za pytanie
  category: string;
  difficulty: string;
}

export default function SinglePlayerQuiz() {
  const supabase = createClient();
  const router = useRouter();

  // --- STANY ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalExp, setTotalExp] = useState(0); // Sumujemy zdobyty EXP
  const [gameStatus, setGameStatus] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [saving, setSaving] = useState(false);

  // --- CZAS ---
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. POBIERANIE PYTAŃ (Z SCHEMATU TRIVIA)
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data, error } = await supabase
          .from('trivia_questions') // ✅ Poprawna nazwa tabeli z Twojej listy
          .select('*')
          .eq('is_active', true) 
          .limit(50);
  
        if (error) throw error;
  
        if (data && data.length > 0) {
          // Losujemy 10 pytań z puli 65 dostępnych w Twoim pliku CSV
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
          setQuestions(shuffled);
          setGameStatus('playing');
          setStartTime(Date.now());
        } else {
          setError("Baza pytań trivia_questions jest pusta.");
        }
      } catch (err: any) {
        console.error("Błąd pobierania:", err);
        setError(`Błąd: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  
    fetchQuestions();
  }, []);

  // 2. LOGIKA TIMERA
  useEffect(() => {
    if (gameStatus === 'playing' && questions.length > 0) {
      startTimer();
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [currentQ, gameStatus]);

  const startTimer = () => {
    clearInterval(timerRef.current as NodeJS.Timeout);
    setTimeLeft(15);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    clearInterval(timerRef.current as NodeJS.Timeout);
    handleAnswer(-1);
  };

  const handleAnswer = (index: number) => {
    clearInterval(timerRef.current as NodeJS.Timeout);
    if (selected !== null) return;

    setSelected(index);
    
    // Używamy pola 'correct' z Twojej bazy
    const currentQuestion = questions[currentQ];
    const correctIndex = currentQuestion.correct; 
    const isAnsCorrect = index === correctIndex;
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) {
      setScore(prev => prev + 1);
      setTotalExp(prev => prev + currentQuestion.exp); // Dodajemy EXP z pytania
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        finishGame(isAnsCorrect ? score + 1 : score, isAnsCorrect ? totalExp + currentQuestion.exp : totalExp);
      }
    }, 1500);
  };

  const finishGame = async (finalScore: number, finalExp: number) => {
    setGameStatus('finished');
    const endTime = Date.now();
    const duration = endTime - startTime;
    setTotalTime(duration);
    
    if (finalScore > questions.length / 2) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0055ff', '#BF2024', '#ffffff']
      });
    }

    // --- ZAPIS WYNIKU ---
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. Zapisz w tabeli wyników (zakładam, że masz 'quiz_results' w public, jeśli w trivia to dodaj .schema('trivia'))
      // Jeśli tabela quiz_results jest w public, nie dodawaj .schema()
      const { error: resultError } = await supabase.from('quiz_results').insert({
        user_id: user.id,
        correct_answers: finalScore,
        total_time_ms: duration,
      });
      
      if (resultError) console.error("Błąd zapisu wyniku:", resultError);

      // 2. Aktualizacja profilu (Kuleczki + Exp z bazy)
      const kuleczkiReward = (finalScore * 10) + 5; 
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('kuleczki, exp')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase.from('profiles').update({
          kuleczki: (profile.kuleczki || 0) + kuleczkiReward,
          exp: (profile.exp || 0) + finalExp // Dodajemy rzeczywisty EXP z pytań
        }).eq('id', user.id);
      }
    }
    setSaving(false);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-hidden flex flex-col items-center justify-center">
      
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles particleCount={50} particleColors={["#22c55e", "#0055ff"]} alphaParticles speed={0.2} />
      </div>

      {gameStatus === 'playing' && (
        <div className="w-full max-w-2xl px-6 relative z-10">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6 text-white">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="text-xl">{questions[currentQ].category.split(' ')[0]}</span> {/* Emoji kategorii */}
              <span className="font-black text-sm uppercase tracking-widest text-zinc-300">
                 {questions[currentQ].category.split(' ').slice(1).join(' ')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <Timer size={18} className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
              <span className={`font-black text-lg ${timeLeft < 5 ? 'text-red-500' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/5 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="h-full bg-linear-to-r from-blue-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
            />
          </div>

          {/* Karta Pytania */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Pytanie {currentQ + 1} / {questions.length}
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                   <Star size={12} fill="currentColor" /> {questions[currentQ].exp} XP
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-8 leading-tight min-h-[80px] flex items-center justify-center">
                {questions[currentQ].question}
              </h2>

              <div className="grid gap-3">
                {questions[currentQ].options.map((opt, idx) => {
                  let btnClass = "bg-white/5 border-white/10 hover:bg-white/10";
                  if (selected !== null) {
                    if (idx === questions[currentQ].correct) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                    else if (selected === idx) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                    else btnClass = "bg-white/5 border-white/5 opacity-30";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left font-bold text-base transition-all duration-200
                        flex justify-between items-center text-zinc-300
                        ${btnClass}
                      `}
                    >
                      <span>{opt}</span>
                      {selected !== null && idx === questions[currentQ].correct && <CheckCircle2 size={20} />}
                      {selected === idx && idx !== questions[currentQ].correct && <XCircle size={20} />}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* --- EKRAN WYNIKÓW --- */}
      {gameStatus === 'finished' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full px-6 text-center"
        >
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden">
            <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center text-zinc-900 shadow-xl mx-auto mb-6 rotate-3">
              <Trophy size={48} strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-black text-white uppercase italic mb-2">Wynik Agenta</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Poprawne</div>
                <div className="text-2xl font-black text-white">{score}/{questions.length}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Zdobyte XP</div>
                <div className="text-2xl font-black text-purple-400">+{totalExp}</div>
              </div>
            </div>
            
            {saving ? (
              <div className="flex items-center justify-center gap-2 text-blue-400 font-bold mb-6 text-sm animate-pulse">
                <Loader2 size={16} className="animate-spin" /> Zapisywanie postępów...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold mb-6 text-sm">
                <CheckCircle2 size={16} /> Wynik zapisany w bazie!
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => window.location.reload()} className="w-full py-3 bg-white text-zinc-950 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
                <RefreshCcw size={18} /> Zagraj Ponownie
              </button>
              <button onClick={() => router.push('/gry')} className="w-full py-3 bg-transparent border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm">
                <Home size={18} /> Powrót do Bazy
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-white">
      <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
      <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Ładowanie misji...</h2>
    </main>
  )
}

function ErrorScreen({ error }: { error: string }) {
  const router = useRouter();
  return (
    <main className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-white px-6 text-center">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-black uppercase mb-2">Błąd Połączenia</h2>
      <p className="text-zinc-400 mb-8 max-w-md">{error}</p>
      <button onClick={() => router.push('/gry')} className="px-8 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all">
        Wróć do Bazy
      </button>
    </main>
  )
}