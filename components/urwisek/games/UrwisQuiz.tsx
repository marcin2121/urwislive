"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { RefreshCw, Play, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// --- TYPY URWISÓW ---
const URWIS_TYPES = {
  BUILDER: {
    id: 'BUILDER',
    title: 'Urwis Budowniczy 🧱',
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-500',
    desc: 'Najlepiej czujesz się wśród klocków! Twoja wyobraźnia nie zna granic. Jesteś cierpliwy, dokładny i potrafisz stworzyć coś niesamowitego z niczego.',
    image: '/urwis-budowniczy.webp'
  },
  ARTIST: {
    id: 'ARTIST',
    title: 'Urwis Artysta 🎨',
    color: 'from-pink-500 to-rose-500',
    textColor: 'text-pink-500',
    desc: 'Biała kartka to dla Ciebie początek przygody! Świat widzisz w niesamowitych barwach. Zawsze masz głowę pełną kreatywnych i szalonych pomysłów.',
    image: '/urwis-artysta.webp'
  },
  EXPLORER: {
    id: 'EXPLORER',
    title: 'Urwis Odkrywca 🗺️',
    color: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-500',
    desc: 'Nie potrafisz usiedzieć w miejscu! Uwielbiasz zagadki, nowe miejsca i bycie w ruchu. Każdy dzień to dla Ciebie okazja do nowej, wspaniałej misji.',
    image: '/urwis-odkrywca.webp'
  },
  JOKER: {
    id: 'JOKER',
    title: 'Urwis Śmieszek 😆',
    color: 'from-yellow-400 to-orange-500',
    textColor: 'text-orange-500',
    desc: 'Twój śmiech zaraża wszystkich dookoła! Jesteś duszą towarzystwa, uwielbiasz gry zręcznościowe, żarty i sprawianie, by inni pękali ze śmiechu.',
    image: '/urwis-smieszek.webp'
  }
};

// --- PYTANIA ---
const QUESTIONS = [
  {
    question: 'Gdy masz wolne popołudnie, najchętniej...',
    answers: [
      { text: 'Wysypuję całe pudło klocków i coś buduję.', type: 'BUILDER' },
      { text: 'Wyciągam kredki i robię arcydzieło.', type: 'ARTIST' },
      { text: 'Biegam po podwórku i szukam skarbów.', type: 'EXPLORER' },
      { text: 'Gram w gry i wymyślam wesołe żarty.', type: 'JOKER' }
    ]
  },
  {
    question: 'Twoja ulubiona zabawka to:',
    answers: [
      { text: 'Gra planszowa pełna rywalizacji.', type: 'JOKER' },
      { text: 'Zestaw LEGO z mnóstwem elementów.', type: 'BUILDER' },
      { text: 'Pluszak, z którym zwiedzam świat.', type: 'EXPLORER' },
      { text: 'Plastelina, z której lepię potworki.', type: 'ARTIST' }
    ]
  },
  {
    question: 'Co zrobisz, gdy pada deszcz?',
    answers: [
      { text: 'Czytam książki o kosmosie i dinozaurach.', type: 'EXPLORER' },
      { text: 'Buduję wielką bazę z koców i poduszek.', type: 'BUILDER' },
      { text: 'Głupkuję z rodzeństwem lub układam puzzle.', type: 'JOKER' },
      { text: 'Robię laurkę dla rodziców.', type: 'ARTIST' }
    ]
  },
  {
    question: 'Twoim superbohaterem mógłby zostać ktoś, kto...',
    answers: [
      { text: 'Potrafi podróżować w czasie i przestrzeni.', type: 'EXPLORER' },
      { text: 'Rzuca magicznymi zaklęciami pełnymi brokatu.', type: 'ARTIST' },
      { text: 'Dzięki swojemu sprytowi przechytrza każdego.', type: 'JOKER' },
      { text: 'Tworzy niesamowite maszyny i gadżety.', type: 'BUILDER' }
    ]
  },
  {
    question: 'W szkole lub przedszkolu najbardziej lubisz:',
    answers: [
      { text: 'Zajęcia plastyczne i wycinanki.', type: 'ARTIST' },
      { text: 'Przerwy! (I rozśmieszanie kolegów).', type: 'JOKER' },
      { text: 'Zajęcia o naturze i wycieczki klasowe.', type: 'EXPLORER' },
      { text: 'Zajęcia konstrukcyjne, matematykę.', type: 'BUILDER' }
    ]
  }
];

export default function UrwisQuiz() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [scores, setScores] = useState({ BUILDER: 0, ARTIST: 0, EXPLORER: 0, JOKER: 0 });
  const [result, setResult] = useState<keyof typeof URWIS_TYPES | null>(null);

  const trackQuizEvent = (action: string, resultLabel?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'quiz_interakcja', {
        'event_category': 'Quiz',
        'event_label': action,
        'quiz_result': resultLabel
      });
    }
  };

  const handleStart = () => {
    trackQuizEvent('start');
    setIsStarted(true);
    setCurrentQuestionIdx(0);
    setScores({ BUILDER: 0, ARTIST: 0, EXPLORER: 0, JOKER: 0 });
    setResult(null);
  };

  const handleAnswer = (type: keyof typeof URWIS_TYPES) => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);

    if (currentQuestionIdx + 1 < QUESTIONS.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Obliczanie wyniku
      let winnerType: keyof typeof URWIS_TYPES = 'JOKER';
      let maxScore = -1;
      for (const [key, value] of Object.entries(newScores)) {
        if (value > maxScore) {
          maxScore = value;
          winnerType = key as keyof typeof URWIS_TYPES;
        }
      }
      setResult(winnerType);
      trackQuizEvent('koniec', winnerType);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#1a1c29] p-4 relative overflow-hidden font-sans">
      
      {/* Tło i promienie */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Górny Pasek Powrotu */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center pointer-events-none">
        <Link 
          href="/strefa-zabawy"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-800 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group pointer-events-auto"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Strefy Zabawy
        </Link>
      </div>

      <AnimatePresence mode="wait">
        
        {/* EKRAN STARTOWY */}
        {!isStarted && !result && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="z-10 w-full max-w-md h-auto"
          >
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
               <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
                  <HelpCircle className="w-12 h-12 text-white" />
               </div>
               <h1 className="text-3xl md:text-4xl font-black italic uppercase text-white mb-2 leading-tight">
                  Jakim <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Urwisem</span> jesteś?
               </h1>
               <p className="text-zinc-400 font-medium mb-8">
                  Odpowiedz na 5 luźnych pytań i dowiedz się, co drzemie w Twojej naturze!
               </p>
               <Button 
                 onClick={handleStart}
                 className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all outline-none"
               >
                 <Play className="w-5 h-5 mr-2" /> ZACZYNAMY!
               </Button>
            </Card>
          </motion.div>
        )}

        {/* EKRAN PYTAŃ */}
        {isStarted && !result && (
          <motion.div 
            key={`question-${currentQuestionIdx}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="z-10 w-full max-w-xl h-auto"
          >
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 p-6 md:p-10 rounded-[3rem] shadow-2xl w-full">
               <div className="flex items-center gap-2 mb-6">
                 {QUESTIONS.map((_, idx) => (
                   <div 
                     key={idx} 
                     className={`h-2 flex-1 rounded-full transition-all duration-300 ${idx <= currentQuestionIdx ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`} 
                   />
                 ))}
               </div>

               <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white text-center mb-8 leading-snug">
                 {QUESTIONS[currentQuestionIdx].question}
               </h2>

               <div className="flex flex-col gap-3">
                 {QUESTIONS[currentQuestionIdx].answers.map((answer, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleAnswer(answer.type as keyof typeof URWIS_TYPES)}
                     className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/50 p-5 rounded-2xl text-white font-medium hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-base cursor-pointer outline-none"
                   >
                     {answer.text}
                   </button>
                 ))}
               </div>
            </Card>
          </motion.div>
        )}

        {/* EKRAN WYNIKU */}
        {result && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 w-full max-w-md h-auto"
          >
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 p-8 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
               
               <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${URWIS_TYPES[result].color}`} />
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5 pointer-events-none">
                 {URWIS_TYPES[result].title.split(' ')[2]}
               </div>

               <img 
                 src={URWIS_TYPES[result].image} 
                 alt={URWIS_TYPES[result].title} 
                 className="w-40 h-40 md:w-48 md:h-48 rounded-3xl mx-auto mb-6 object-cover shadow-2xl border-4 border-white/10" 
               />

               <p className="text-zinc-400 font-black uppercase tracking-widest text-xs mb-2">Twój wynik to:</p>
               
               <h1 className={`text-4xl md:text-5xl font-black italic uppercase mb-4 leading-tight ${URWIS_TYPES[result].textColor} drop-shadow-md`}>
                 {URWIS_TYPES[result].title}
               </h1>
               
               <p className="text-zinc-300 font-medium mb-8 leading-relaxed">
                 {URWIS_TYPES[result].desc}
               </p>

               <Button 
                 onClick={handleStart}
                 variant="outline"
                 className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border-white/20 text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all outline-none"
               >
                 <RefreshCw className="w-5 h-5 mr-2" /> Zagraj Jeszcze Raz
               </Button>
               
               <Button 
                 onClick={() => window.location.href = '/strefa-zabawy'}
                 className="w-full h-12 mt-3 rounded-2xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-bold tracking-wider outline-none"
               >
                 Wróć do Strefy
               </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
