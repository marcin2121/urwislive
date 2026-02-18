'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Zap, Timer, Target, Award, Loader2, ArrowRight } from 'lucide-react'

interface QuizDuelProps {
  seed: string;
  onComplete: (results: { score: number, correct: number, time: number }) => void;
  duelData: any;
}

export default function QuizDuelEngine({ seed, onComplete, duelData }: QuizDuelProps) {
  const supabase = createClient();
  
  // Stan gry
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<boolean[]>([]);
  
  // Statystyki
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(15); // 15 sekund na pytanie

  // 1. Pobieranie pytań na podstawie Seed
  // Uwaga: W prawdziwym systemie użyłbyś seed do losowania z bazy, 
  // tutaj pobieramy 10 losowych dla demonstracji.
  useEffect(() => {
    async function fetchDuelQuestions() {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .limit(10); // Możesz dodać logikę filtrowania po kategorii z duelData
      
      if (data) setQuestions(data);
      setLoading(false);
    }
    fetchDuelQuestions();
  }, [seed]);

  // 2. Timer pytania
  useEffect(() => {
    if (loading || currentIdx >= questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(false); // Czas minął = błędna odpowiedź
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, loading]);

  // 3. Obsługa odpowiedzi
  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (isCorrect) {
      // Formuła punktowa: Podstawa (5000) + Bonus za czas (max 5000)
      const timeBonus = Math.floor((timeLeft / 15) * 5000);
      setScore(prev => prev + 5000 + timeBonus);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(15);
    } else {
      // KONIEC GRY
      const totalTime = Date.now() - startTime;
      const correctCount = newAnswers.filter(a => a).length;
      
      // Finalny raport do kontrolera
      onComplete({
        score: score + (isCorrect ? 5000 : 0), // Dodaj punkt za ostatnie pytanie
        correct: correctCount,
        time: totalTime
      });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="text-zinc-500 font-black uppercase italic tracking-widest">Generowanie zestawu bojowego...</p>
    </div>
  );

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HUD POJEDYNKU */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Timer className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Czas Operacji</p>
            <p className={`text-xl font-black italic ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Postęp</p>
          <p className="text-xl font-black italic">{currentIdx + 1} / {questions.length}</p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Wynik Bitwy</p>
            <p className="text-xl font-black italic text-yellow-500">{score.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
            <Zap className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      {/* PASEK POSTĘPU (WIZUALNY) */}
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          className="h-full bg-linear-to-r from-blue-600 to-purple-600"
        />
      </div>

      {/* KARTA PYTANIA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-12 rounded-[4rem] shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-center mb-12 leading-tight">
            {currentQuestion.content}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(option === currentQuestion.correct_answer)}
                className="group relative p-6 bg-white/5 border border-white/5 rounded-3xl text-left hover:bg-white hover:text-zinc-950 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  <ArrowRight size={40} />
                </div>
                <span className="text-[10px] font-black uppercase opacity-40 mb-2 block group-hover:text-zinc-950/50">Opcja 0{i+1}</span>
                <span className="text-lg font-bold">{option}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2">
        {questions.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
              i < currentIdx ? (answers[i] ? 'bg-green-500' : 'bg-red-500') : 
              i === currentIdx ? 'bg-blue-500 animate-pulse' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}