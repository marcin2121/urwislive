"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// ═══════════════════════════════════════════════════════════
// 🔠 POLSKIE SŁOWA (5-literowe)
// ═══════════════════════════════════════════════════════════

const WORDS = [
  'KOTEK', 'MIODY', 'LAMPA', 'ARBUZ', 'MORZE', 'TANIO', 'MOTYL', 'KLASA', 'DOMEK', 'NUMER',
  'STARY', 'PIRAT', 'KWIAT', 'TORBA', 'GRACZ', 'IGLOO', 'BALON', 'MLEKO', 'KOLOR', 'OWOCE'
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type TileState = 'empty' | 'tbd' | 'correct' | 'present' | 'absent';

const STATE_COLORS: Record<TileState, string> = {
  empty: '#d4d4d8',
  tbd: '#a1a1aa',
  correct: '#22c55e',
  present: '#eab308',
  absent: '#52525b',
};

// ═══════════════════════════════════════════════════════════
// 🎮 KOMPONENT
// ═══════════════════════════════════════════════════════════

export default function WordleGame() {
  const [answer, setAnswer] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [dictionary, setDictionary] = useState<Set<string>>(new Set(WORDS));
  const [dictList, setDictList] = useState<string[]>(WORDS);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const hs = localStorage.getItem('urwis-literki-streak');
    if (hs) setBest(parseInt(hs));

    fetch('/words5.json')
      .then(res => res.json())
      .then((data: string[]) => {
        const up = data.map(w => w.toUpperCase());
        setDictList(up);
        setDictionary(new Set(up));
        // Wylosuj nowe od razu z nowego, większego słownika
        if (guesses.length === 0) {
          setAnswer(up[Math.floor(Math.random() * up.length)]);
        }
      })
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial answer (fallback until fetch completes)
  useEffect(() => {
    if (!answer) setAnswer(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }, [answer]);

  const getLetterState = (guess: string, idx: number): TileState => {
    const letter = guess[idx];
    if (letter === answer[idx]) return 'correct';
    if (answer.includes(letter)) {
      // Sprawdź czy nie jest już w lepszej pozycji
      const answerCount = [...answer].filter(c => c === letter).length;
      const correctCount = [...guess].filter((c, i) => c === letter && answer[i] === letter).length;
      const presentBefore = [...guess].slice(0, idx).filter((c, i) => c === letter && answer[i] !== letter).length;
      if (presentBefore + correctCount < answerCount) return 'present';
    }
    return 'absent';
  };

  const getKeyState = useCallback((letter: string): TileState => {
    let best: TileState = 'empty';
    for (const guess of guesses) {
      const uGuess = guess.toUpperCase();
      for (let i = 0; i < uGuess.length; i++) {
        if (uGuess[i] === letter) {
          const state = getLetterState(uGuess, i);
          if (state === 'correct') return 'correct';
          if (state === 'present') best = 'present';
          if (state === 'absent' && best === 'empty') best = 'absent';
        }
      }
    }
    return best;
  }, [guesses, answer]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LENGTH) return;

    if (!dictionary.has(current.toUpperCase())) {
      setMessage('Nie znamy takiego słowa');
      setShake(true);
      setTimeout(() => { setShake(false); setMessage(''); }, 1500);
      return;
    }

    const newGuesses = [...guesses, current.toUpperCase()];
    setGuesses(newGuesses);
    setCurrent('');

    if (current.toUpperCase() === answer) {
      setGameState('won');
      setStreak(s => {
        const ns = s + 1;
        setBest(b => {
          const nb = Math.max(b, ns);
          localStorage.setItem('urwis-literki-streak', String(nb));
          return nb;
        });
        return ns;
      });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost');
      setStreak(0);
    }
  }, [current, guesses, answer, dictionary]);

  const addLetter = useCallback((l: string) => {
    if (gameState !== 'playing') return;
    if (l === 'ENTER') { submitGuess(); return; }
    if (l === 'BACK') { setCurrent(c => c.slice(0, -1)); return; }
    if (current.length < WORD_LENGTH) setCurrent(c => c + l);
  }, [current, gameState, submitGuess]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') addLetter('ENTER');
      else if (e.key === 'Backspace') addLetter('BACK');
      else if (/^[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ]$/.test(e.key)) addLetter(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [addLetter]);

  const restart = () => {
    setAnswer(dictList[Math.floor(Math.random() * dictList.length)].toUpperCase());
    setGuesses([]);
    setCurrent('');
    setGameState('playing');
    setMessage('');
  };

  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM', 'ĄĆĘŁŃÓŚŹŻ'];

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      {gameState === 'won' && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} />}

      <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white text-center shadow-md z-10 flex items-center justify-between px-6">
        <button onClick={() => setShowHelp(h => !h)} className="p-2 rounded-full hover:bg-white/20"><HelpCircle size={20} /></button>
        <h2 className="text-2xl font-black italic tracking-wider">LITERKI</h2>
        <button onClick={restart} className="p-2 rounded-full hover:bg-white/20"><RotateCcw size={20} /></button>
      </div>

      <div className="w-full flex items-center justify-between px-6 py-2 bg-white border-b border-zinc-100">
        <div className="text-center w-24">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Seria</div>
          <div className="text-lg font-black text-emerald-600">{streak}</div>
        </div>
        <div className="text-center w-24">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Rekord</div>
          <div className="text-lg font-black text-zinc-900">{best}</div>
        </div>
      </div>

      {message && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-black text-sm mt-3">
          {message}
        </motion.div>
      )}

      {showHelp && (
        <div className="mx-4 mt-3 p-4 bg-zinc-50 rounded-xl text-xs text-zinc-600 leading-relaxed border border-zinc-200">
          <p className="font-black mb-1">Jak grać?</p>
          <p>Zgadnij 5-literowe słowo w 6 prób. Po każdej próbie kolory liter się zmienią:</p>
          <div className="flex items-center gap-2 mt-2"><div className="w-6 h-6 rounded bg-emerald-500" /> = litera na właściwym miejscu</div>
          <div className="flex items-center gap-2 mt-1"><div className="w-6 h-6 rounded bg-yellow-500" /> = litera jest w słowie, ale nie tu</div>
          <div className="flex items-center gap-2 mt-1"><div className="w-6 h-6 rounded bg-zinc-600" /> = litery nie ma w słowie</div>
        </div>
      )}

      {/* GRID */}
      <div className="flex flex-col gap-1.5 p-4 mt-2">
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const guess = guesses[row];
          const isCurrent = row === guesses.length && gameState === 'playing';
          return (
            <motion.div
              key={row}
              className="flex gap-1.5"
              animate={shake && isCurrent ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, col) => {
                const letter = guess ? guess[col] : isCurrent ? current[col] : undefined;
                const state: TileState = guess ? getLetterState(guess, col) : letter ? 'tbd' : 'empty';
                return (
                  <motion.div
                    key={col}
                    initial={guess ? { rotateX: 90 } : false}
                    animate={guess ? { rotateX: 0 } : {}}
                    transition={{ delay: col * 0.15, duration: 0.3 }}
                    className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] flex items-center justify-center rounded-lg font-black text-xl uppercase border-2 transition-colors"
                    style={{
                      backgroundColor: state === 'empty' || state === 'tbd' ? 'white' : STATE_COLORS[state],
                      borderColor: state === 'tbd' ? '#71717a' : state === 'empty' ? '#d4d4d8' : STATE_COLORS[state],
                      color: state === 'empty' || state === 'tbd' ? '#18181b' : 'white',
                    }}
                  >
                    {letter || ''}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* GAME OVER */}
      {gameState !== 'playing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2 pb-2">
          {gameState === 'won' ? (
            <p className="text-emerald-600 font-black uppercase tracking-widest text-sm flex items-center gap-2"><Trophy size={16} /> Brawo! Zgadłeś!</p>
          ) : (
            <p className="text-zinc-500 font-bold text-sm">Słowo to: <span className="font-black text-zinc-900">{answer}</span></p>
          )}
          <button onClick={restart} className="px-6 py-3 bg-zinc-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
            NOWE SŁOWO
          </button>
        </motion.div>
      )}

      {/* KEYBOARD */}
      <div className="w-full px-2 pb-4 flex flex-col items-center gap-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {ri === 2 && (
              <button onClick={() => addLetter('ENTER')}
                className="px-3 py-3 bg-zinc-200 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-zinc-300 active:scale-95 transition-all">
                ENTER
              </button>
            )}
            {row.split('').map(letter => {
              const keyState = getKeyState(letter);
              return (
                <button
                  key={letter}
                  onClick={() => addLetter(letter)}
                  className="w-[30px] sm:w-[34px] h-[44px] rounded-lg font-black text-sm uppercase transition-all hover:brightness-110 active:scale-95"
                  style={{
                    backgroundColor: keyState === 'empty' ? '#e4e4e7' : STATE_COLORS[keyState],
                    color: keyState === 'empty' || keyState === 'tbd' ? '#18181b' : 'white',
                  }}
                >
                  {letter}
                </button>
              );
            })}
            {ri === 2 && (
              <button onClick={() => addLetter('BACK')}
                className="px-3 py-3 bg-zinc-200 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-zinc-300 active:scale-95 transition-all">
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
