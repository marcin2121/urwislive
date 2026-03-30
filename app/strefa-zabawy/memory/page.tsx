"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Activity, Timer, Brain } from "lucide-react";
import confetti from 'canvas-confetti';

// --- KONFIGURACJA ---
const ANIMATION_DURATION = 0.25;
const AUTO_CLOSE_DELAY = 1000;

const SOUNDS = {
  flip: '/sounds/flip.mp3',
  match: '/sounds/correct.mp3',
  win: '/sounds/win.mp3',
  error: '/sounds/wrong.mp3',
};

const EMOJI_SET = [
  '🧸', '🚗', '🚀', '🦄', '🦖', '🎨', '🎮', '🧩',
  '⚽', '🎸', '🍦', '🍕', '🦁', '🐼', '🐯', '🐙',
  '🦋', '🌻', '🌈', '⚡'
];

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameConfig {
  rows: number;
  cols: number;
  label: string;
}

const DIFFICULTIES: Record<Difficulty, GameConfig> = {
  easy: { rows: 3, cols: 4, label: 'Łatwy (12 kart)' },
  medium: { rows: 4, cols: 4, label: 'Średni (16 kart)' },
  hard: { rows: 4, cols: 5, label: 'Trudny (20 kart)' },
};

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGamePage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [combo, setCombo] = useState(0);

  const mismatchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playSound = (type: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isGameWon) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGameWon]);

  useEffect(() => {
    return () => {
      if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
    };
  }, []);

  const startGame = (diff: Difficulty) => {
    const config = DIFFICULTIES[diff];
    const totalCards = config.rows * config.cols;
    const uniquePairs = totalCards / 2;

    const selectedEmojis = EMOJI_SET.sort(() => 0.5 - Math.random()).slice(0, uniquePairs);
    const gameDeck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => 0.5 - Math.random())
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setDifficulty(diff);
    setCards(gameDeck);
    setFlippedIndices([]);
    setMoves(0);
    setTimer(0);
    setCombo(0);
    setIsGameWon(false);
    setIsPlaying(true);

    if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
  };

  const handleCardClick = (index: number) => {
    if (!isPlaying || cards[index].isMatched || cards[index].isFlipped) return;

    playSound('flip');

    if (flippedIndices.length === 2) {
      if (mismatchTimeoutRef.current) {
        clearTimeout(mismatchTimeoutRef.current);
        mismatchTimeoutRef.current = null;
      }

      const [idx1, idx2] = flippedIndices;
      setCards(prev => prev.map((c, i) => {
        if (i === index) return { ...c, isFlipped: true };
        if (i === idx1 || i === idx2) return { ...c, isFlipped: false };
        return c;
      }));

      setFlippedIndices([index]);
      return;
    }

    setCards(prev => prev.map((c, i) => i === index ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, _secondIdx] = newFlipped;

      if (cards[firstIdx].emoji === cards[index].emoji) {
        // MATCH
        playSound('match');
        setCombo(c => c + 1);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#34d399', '#10b981']
        });

        setCards(prev => prev.map((c, i) =>
          i === firstIdx || i === index ? { ...c, isMatched: true, isFlipped: true } : c
        ));
        setFlippedIndices([]);

        const allMatched = cards.filter(c => !c.isMatched).length <= 2;
        if (allMatched) handleWin();

      } else {
        // MISMATCH
        playSound('error');
        setCombo(0);

        mismatchTimeoutRef.current = setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === firstIdx || i === index ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          mismatchTimeoutRef.current = null;
        }, AUTO_CLOSE_DELAY);
      }
    }
  };

  const handleWin = () => {
    setTimeout(() => {
      setIsGameWon(true);
      setIsPlaying(false);
      playSound('win');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-32 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link 
          href="/strefa-zabawy" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Strefy Zabawy
        </Link>

        {/* --- WSPOLNY NAGLOWEK --- */}
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-2 pr-8 pb-2 pl-1 text-center md:text-left leading-tight">
          Pamięć <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 pr-8">Urwisa</span>
        </h1>
        <p className="text-zinc-500 font-medium mb-12 text-center md:text-left text-lg max-w-2xl px-2">
          Trenuj swoją pamięć odszukując identyczne pary. Pnij się na wyżyny w mniejszej ilości ruchów!
        </p>

        {!difficulty ? (
          /* --- SEKCJA WYBORU TRUDNOSCI --- */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {(Object.entries(DIFFICULTIES) as [Difficulty, GameConfig][]).map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(key)}
                className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-emerald-500 transition-all text-left flex flex-col items-center justify-center min-h-[200px] group outline-none"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 text-emerald-500">
                   <Brain size={100} />
                </div>
                <div className="text-5xl mb-4 relative z-10">{key === 'easy' ? '🧸' : key === 'medium' ? '🧩' : '🎓'}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 relative z-10">{config.label}</h3>
              </motion.button>
            ))}
          </div>
        ) : (
          /* --- ZABAWY / GAME BOARD --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar / HUD */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                 <Timer className="text-emerald-500 mb-2" size={32} />
                 <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Czas gry</h3>
                 <span className="text-4xl font-black italic tracking-tighter text-zinc-900">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                 </span>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col items-center justify-center">
                 <Activity className="text-blue-500 mb-2" size={32} />
                 <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Ruchy</h3>
                 <span className="text-4xl font-black italic tracking-tighter text-zinc-900">{moves}</span>
              </div>

              {combo > 1 && (
                <div className="bg-amber-50 rounded-3xl p-4 border border-amber-200 flex flex-col items-center justify-center animate-pulse">
                  <span className="text-amber-500 font-black uppercase text-sm tracking-widest">Combo</span>
                  <span className="text-3xl font-black italic tracking-tighter text-amber-600">{combo}x</span>
                </div>
              )}

              <button
                onClick={() => setDifficulty(null)}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 outline-none"
              >
                <RotateCcw size={18} /> Zmień poziom
              </button>
            </div>

            {/* Game Board */}
            <div className="lg:col-span-9 flex justify-center w-full">
               <div className="bg-white/60 backdrop-blur-3xl p-4 md:p-8 rounded-[3rem] shadow-2xl border-4 border-white inline-block relative w-full overflow-hidden">
                  
                  <AnimatePresence>
                    {isGameWon && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white"
                      >
                        <Trophy size={80} className="mb-6 drop-shadow-lg" />
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 drop-shadow-md">
                          Hurra! Wygrywasz!
                        </h2>
                        <p className="font-bold text-xl drop-shadow mb-8 opacity-90 max-w-sm px-4">
                          Masz lepszą pamięć ode mnie! Zebrane w {moves} ruchach i {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')} min!
                        </p>
                        
                        <div className="flex gap-4 flex-col sm:flex-row">
                          <button
                            onClick={() => startGame(difficulty)}
                            className="px-8 py-4 bg-white text-emerald-600 rounded-full font-black uppercase italic tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 outline-none"
                          >
                            Zagraj ponownie <RotateCcw size={18} />
                          </button>
                          <button
                            onClick={() => setDifficulty(null)}
                            className="px-8 py-4 bg-emerald-700 text-white rounded-full font-black uppercase italic tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center outline-none"
                          >
                            Zmień poziom
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Grid */}
                  <div 
                    className="grid gap-2 md:gap-4 relative z-10 w-full mx-auto select-none"
                    style={{
                      gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, minmax(0, 1fr))`,
                      aspectRatio: `${DIFFICULTIES[difficulty].cols}/${DIFFICULTIES[difficulty].rows}`
                    }}
                  >
                    {cards.map((card, index) => (
                      <div 
                        key={card.id} 
                        className="relative w-full h-full perspective-1000 cursor-pointer"
                        onClick={() => handleCardClick(index)}
                      >
                        <motion.div
                          className="w-full h-full relative preserve-3d"
                          initial={false}
                          animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                          transition={{ duration: ANIMATION_DURATION, ease: "easeInOut" }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* Front (Back of card visually) */}
                          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl md:rounded-2xl shadow-md border-b-4 border-emerald-700 flex items-center justify-center overflow-hidden">
                            <img src="/urwis-icon.webp" alt="Tył Karty Urwisa" draggable={false} className="w-[80%] h-[80%] opacity-30 object-contain drop-shadow-sm grayscale contrast-125 select-none pointer-events-none" />
                          </div>

                          {/* Back (Front of card with Emoji) */}
                          <div 
                            className={`absolute inset-0 backface-hidden rounded-xl md:rounded-2xl shadow-lg flex flex-col items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl bg-white border-2 rotate-y-180 overflow-hidden select-none cursor-pointer
                              ${card.isMatched ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-100'}
                            `}
                          >
                             {card.isMatched && <div className="absolute inset-0 bg-emerald-400/20 backdrop-blur-[1px] z-10 flex items-center justify-center"></div>}
                             <motion.div 
                               animate={card.isMatched ? { scale: [1, 1.2, 1] } : {}}
                               transition={{ duration: 0.5 }}
                               className="relative z-0"
                             >
                               {card.emoji}
                             </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>

               </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
