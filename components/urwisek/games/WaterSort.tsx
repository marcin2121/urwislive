"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, RotateCcw, Shuffle, Trophy, Droplets } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// ═══════════════════════════════════════════════════════════
// 🎨 PALETA KOLORÓW PŁYNÓW
// ═══════════════════════════════════════════════════════════

const COLORS: Record<number, { bg: string; border: string; name: string }> = {
  1: { bg: 'bg-red-500', border: 'border-red-600', name: 'Czerwony' },
  2: { bg: 'bg-blue-500', border: 'border-blue-600', name: 'Niebieski' },
  3: { bg: 'bg-emerald-500', border: 'border-emerald-600', name: 'Zielony' },
  4: { bg: 'bg-amber-400', border: 'border-amber-500', name: 'Żółty' },
  5: { bg: 'bg-purple-500', border: 'border-purple-600', name: 'Fioletowy' },
  6: { bg: 'bg-pink-500', border: 'border-pink-600', name: 'Różowy' },
  7: { bg: 'bg-cyan-400', border: 'border-cyan-500', name: 'Turkusowy' },
  8: { bg: 'bg-orange-500', border: 'border-orange-600', name: 'Pomarańczowy' },
};

const TUBE_CAPACITY = 4;

// ═══════════════════════════════════════════════════════════
// 🧪 GENERATOR POZIOMÓW (gwarantowana grywalność)
// ═══════════════════════════════════════════════════════════

type Tube = number[]; // tablica kolorów od dołu do góry

function generateLevel(numColors: number): Tube[] {
  // Budujemy od stanu wygranego i tasujemy
  const layers: number[] = [];
  for (let c = 1; c <= numColors; c++) {
    for (let i = 0; i < TUBE_CAPACITY; i++) {
      layers.push(c);
    }
  }

  // Fisher-Yates shuffle
  for (let i = layers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [layers[i], layers[j]] = [layers[j], layers[i]];
  }

  // Rozdzielamy na probówki
  const tubes: Tube[] = [];
  for (let i = 0; i < numColors; i++) {
    tubes.push(layers.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
  }

  // Dodaj 2 puste probówki
  tubes.push([]);
  tubes.push([]);

  return tubes;
}

// ═══════════════════════════════════════════════════════════
// 🔬 LOGIKA GRY
// ═══════════════════════════════════════════════════════════

function canPour(from: Tube, to: Tube): boolean {
  if (from.length === 0) return false;
  if (to.length >= TUBE_CAPACITY) return false;
  if (to.length === 0) return true;
  return from[from.length - 1] === to[to.length - 1];
}

function pour(from: Tube, to: Tube): [Tube, Tube] {
  const newFrom = [...from];
  const newTo = [...to];
  const topColor = newFrom[newFrom.length - 1];

  while (
    newFrom.length > 0 &&
    newTo.length < TUBE_CAPACITY &&
    newFrom[newFrom.length - 1] === topColor
  ) {
    newTo.push(newFrom.pop()!);
  }

  return [newFrom, newTo];
}

function isSolved(tubes: Tube[]): boolean {
  return tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0]))
  );
}

function isTubeComplete(tube: Tube): boolean {
  return (
    tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0])
  );
}

const FLUID_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#3b82f6',
  3: '#10b981',
  4: '#f59e0b',
  5: '#8b5cf6',
  6: '#ec4899',
  7: '#06b6d4',
  8: '#f97316',
};

function TubeComponent({
  tube,
  index,
  isSelected,
  isComplete,
  onClick,
}: {
  tube: Tube;
  index: number;
  isSelected: boolean;
  isComplete: boolean;
  onClick: () => void;
}) {
  const layerH = 32;
  const tubeH = TUBE_CAPACITY * layerH + 16;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      animate={{
        y: isSelected ? -20 : 0,
        transition: { type: 'spring', stiffness: 300, damping: 18 },
      }}
      className="relative flex flex-col items-center cursor-pointer focus:outline-none group"
      aria-label={`Probówka ${index + 1}`}
    >
      {/* Tube container – efekt szkła */}
      <div
        className={`relative w-[52px] sm:w-[58px] md:w-[64px] overflow-hidden transition-all duration-300 ${
          isSelected
            ? 'shadow-[0_0_24px_rgba(59,130,246,0.5)]'
            : isComplete
            ? 'shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            : 'shadow-lg group-hover:shadow-xl'
        }`}
        style={{
          height: tubeH,
          borderRadius: '12px 12px 26px 26px',
          border: isSelected ? '3px solid #3b82f6' : isComplete ? '3px solid #10b981' : '3px solid rgba(255,255,255,0.6)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Warstwy płynów od dołu */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse">
          <AnimatePresence mode="popLayout">
            {tube.map((colorId, layerIdx) => {
              const color = FLUID_COLORS[colorId];
              const isBottom = layerIdx === 0;
              return (
                <motion.div
                  key={`${index}-${layerIdx}-${colorId}`}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: layerH }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    mass: 0.8,
                  }}
                  className="relative w-full"
                  style={{
                    background: `linear-gradient(180deg, ${color}dd 0%, ${color} 60%, ${color}bb 100%)`,
                    borderRadius: isBottom ? '0 0 22px 22px' : '0',
                  }}
                >
                  {/* Efekt błysku na płynie */}
                  <div
                    className="absolute top-0 left-1 right-[60%] h-full opacity-30 rounded-full"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)' }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Efekt szkła – wewnętrzny blask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: '10px 10px 24px 24px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
          }}
        />
      </div>

      {/* Completed badge */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10"
        >
          <Trophy size={13} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════
// 🎮 GŁÓWNY KOMPONENT GAME
// ═══════════════════════════════════════════════════════════

const DIFFICULTIES = [
  { label: 'Łatwy', colors: 4 },
  { label: 'Średni', colors: 6 },
  { label: 'Trudny', colors: 8 },
];

export default function WaterSortGame() {
  const [difficulty, setDifficulty] = useState(0);
  const [tubes, setTubes] = useState<Tube[]>(() =>
    generateLevel(DIFFICULTIES[0].colors)
  );
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const hs = localStorage.getItem('urwis-watersort-streak');
    if (hs) setBest(parseInt(hs));
  }, []);

  const startNewGame = useCallback(
    (diffIdx?: number, isNextGame = false) => {
      const dIdx = diffIdx ?? difficulty;
      if (!isNextGame && !won && moves > 0) {
        setStreak(0);
      }
      setDifficulty(dIdx);
      setTubes(generateLevel(DIFFICULTIES[dIdx].colors));
      setSelectedTube(null);
      setHistory([]);
      setMoves(0);
      setWon(false);
    },
    [difficulty]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTubes(prev);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => m - 1);
    setSelectedTube(null);
  }, [history]);

  const handleTubeClick = useCallback(
    (index: number) => {
      if (won) return;

      if (selectedTube === null) {
        // Wybierz źródło (jeśli nie puste)
        if (tubes[index].length > 0) {
          setSelectedTube(index);
        }
        return;
      }

      if (selectedTube === index) {
        // Odkliknij
        setSelectedTube(null);
        return;
      }

      // Próba przelania
      if (canPour(tubes[selectedTube], tubes[index])) {
        setHistory((h) => [...h, tubes.map((t) => [...t])]);
        const newTubes = tubes.map((t) => [...t]);
        const [newFrom, newTo] = pour(
          newTubes[selectedTube],
          newTubes[index]
        );
        newTubes[selectedTube] = newFrom;
        newTubes[index] = newTo;
        setTubes(newTubes);
        setMoves((m) => m + 1);
        setSelectedTube(null);

        // Check win
        if (isSolved(newTubes)) {
          setWon(true);
          setStreak(s => {
            const ns = s + 1;
            setBest(b => {
              const nb = Math.max(b, ns);
              localStorage.setItem('urwis-watersort-streak', String(nb));
              return nb;
            });
            return ns;
          });
        }
      } else {
        // Niedozwolony ruch – zmień selekcję na klikniętą (jeśli niepusta)
        if (tubes[index].length > 0) {
          setSelectedTube(index);
        } else {
          setSelectedTube(null);
        }
      }
    },
    [selectedTube, tubes, won]
  );

  const completedCount = useMemo(
    () => tubes.filter(isTubeComplete).length,
    [tubes]
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      {won && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* HEADER */}
      <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white text-center shadow-md z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <h2 className="text-3xl font-black italic tracking-wider flex items-center justify-center gap-3 relative z-10">
          <Droplets size={32} /> PRZELEWANKI
        </h2>
      </div>

      {/* DIFFICULTY SELECTOR */}
      <div className="flex gap-2 mt-6 px-4">
        {DIFFICULTIES.map((d, i) => (
          <button
            key={d.label}
            onClick={() => startNewGame(i)}
            className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
              difficulty === i
                ? 'bg-zinc-900 text-white shadow-lg'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* STATS BAR */}
      <div className="flex items-center gap-4 mt-4 text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 flex-wrap justify-center">
        <span>Seria: <span className="text-emerald-600">{streak}</span></span>
        <span>Rekord: <span className="text-zinc-900">{best}</span></span>
        <span>
          Ruchy: <span className="text-zinc-900">{moves}</span>
        </span>
        <span>
          Gotowe:{' '}
          <span className="text-emerald-600">
            {completedCount}/{DIFFICULTIES[difficulty].colors}
          </span>
        </span>
      </div>

      {/* POLE GRY */}
      <div className="flex-1 w-full bg-zinc-50 flex flex-col items-center justify-center p-6 sm:p-8 min-h-[350px]">
        {won ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner">
              <Trophy size={48} />
            </div>
            <h3 className="text-3xl font-black text-zinc-800 uppercase italic">
              Brawo! 🎉
            </h3>
            <p className="text-zinc-500 font-medium">
              Posortowano w <span className="font-black text-zinc-800">{moves}</span>{' '}
              ruchach!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => startNewGame(difficulty, true)}
                className="px-6 py-3 bg-zinc-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
              >
                Kolejny poziom
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 max-w-xl">
            {tubes.map((tube, i) => (
              <TubeComponent
                key={i}
                tube={tube}
                index={i}
                isSelected={selectedTube === i}
                isComplete={isTubeComplete(tube)}
                onClick={() => handleTubeClick(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* KONTROLKI */}
      {!won && (
        <div className="w-full flex items-center justify-center gap-3 p-4 bg-white border-t border-zinc-100">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 text-zinc-600 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Undo2 size={16} /> Cofnij
          </button>
          <button
            onClick={() => startNewGame()}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 text-zinc-600 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={() => startNewGame()}
            className="flex items-center gap-2 px-5 py-3 bg-[#0055ff] text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-md"
          >
            <Shuffle size={16} /> Nowy
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="w-full bg-zinc-100 p-3 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-zinc-200">
        Dotknij probówkę źródłową, potem docelową, by przelać płyn 🧪
      </div>
    </div>
  );
}
