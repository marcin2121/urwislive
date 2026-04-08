"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// ═══════════════════════════════════════════════════════════
// 🎨 KOLORY KAFELKÓW
// ═══════════════════════════════════════════════════════════

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:     { bg: '#e8e0d4', text: '#776e65' },
  4:     { bg: '#ede0c8', text: '#776e65' },
  8:     { bg: '#f2b179', text: '#f9f6f2' },
  16:    { bg: '#f59563', text: '#f9f6f2' },
  32:    { bg: '#f67c5f', text: '#f9f6f2' },
  64:    { bg: '#f65e3b', text: '#f9f6f2' },
  128:   { bg: '#edcf72', text: '#f9f6f2' },
  256:   { bg: '#edcc61', text: '#f9f6f2' },
  512:   { bg: '#edc850', text: '#f9f6f2' },
  1024:  { bg: '#edc53f', text: '#f9f6f2' },
  2048:  { bg: '#edc22e', text: '#f9f6f2' },
  4096:  { bg: '#3c3a32', text: '#f9f6f2' },
};

type Grid = number[][];

// ═══════════════════════════════════════════════════════════
// 🔧 LOGIKA GRY
// ═══════════════════════════════════════════════════════════

function createEmptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addRandom(grid: Grid): Grid {
  const g = grid.map(r => [...r]);
  const empty: [number, number][] = [];
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]); }));
  if (empty.length === 0) return g;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}

function slideRow(row: number[]): { newRow: number[]; score: number } {
  let score = 0;
  const filtered = row.filter(v => v !== 0);
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { newRow: merged, score };
}

function moveLeft(grid: Grid): { grid: Grid; score: number; moved: boolean } {
  let totalScore = 0;
  let moved = false;
  const newGrid = grid.map(row => {
    const { newRow, score } = slideRow(row);
    totalScore += score;
    if (row.some((v, i) => v !== newRow[i])) moved = true;
    return newRow;
  });
  return { grid: newGrid, score: totalScore, moved };
}

function rotateGrid(grid: Grid): Grid {
  const n = grid.length;
  const rotated = createEmptyGrid();
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      rotated[c][n - 1 - r] = grid[r][c];
  return rotated;
}

function move(grid: Grid, dir: 'left' | 'right' | 'up' | 'down'): { grid: Grid; score: number; moved: boolean } {
  let g = grid.map(r => [...r]);
  const rotations: Record<string, number> = { left: 0, down: 1, right: 2, up: 3 };
  for (let i = 0; i < rotations[dir]; i++) g = rotateGrid(g);
  const result = moveLeft(g);
  let ng = result.grid;
  for (let i = 0; i < (4 - rotations[dir]) % 4; i++) ng = rotateGrid(ng);
  return { grid: ng, score: result.score, moved: result.moved };
}

function canMove(grid: Grid): boolean {
  for (const dir of ['left', 'right', 'up', 'down'] as const) {
    if (move(grid, dir).moved) return true;
  }
  return false;
}

function has2048(grid: Grid): boolean {
  return grid.some(row => row.some(v => v >= 2048));
}

// ═══════════════════════════════════════════════════════════
// 🎮 KOMPONENT GRY
// ═══════════════════════════════════════════════════════════

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => addRandom(addRandom(createEmptyGrid())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [wonAcked, setWonAcked] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const saved = localStorage.getItem('urwis-2048-best');
    if (saved) setBest(parseInt(saved));
  }, []);

  const handleMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    
    setGrid(prev => {
      const result = move(prev, dir);
      if (!result.moved) return prev;

      const newGrid = addRandom(result.grid);
      
      setScore(s => {
        const newScore = s + result.score;
        setBest(b => {
          const newBest = Math.max(b, newScore);
          localStorage.setItem('urwis-2048-best', String(newBest));
          return newBest;
        });
        return newScore;
      });

      if (has2048(newGrid) && !wonAcked) {
        setWon(true);
      }

      if (!canMove(newGrid)) {
        setGameOver(true);
      }

      return newGrid;
    });
  }, [gameOver, wonAcked]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      };
      const dir = keyMap[e.key];
      if (dir) { e.preventDefault(); handleMove(dir); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  // Touch/swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;
    if (absDx > absDy) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
    touchStartRef.current = null;
  };

  const restart = () => {
    setGrid(addRandom(addRandom(createEmptyGrid())));
    setScore(0);
    setGameOver(false);
    setWon(false);
    setWonAcked(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      {won && !wonAcked && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

      {/* HEADER */}
      <div className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 p-5 text-white text-center shadow-md z-10 relative overflow-hidden">
        <h2 className="text-4xl font-black italic tracking-wider relative z-10">2048</h2>
      </div>

      {/* STATS */}
      <div className="w-full flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-100">
        <div className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-center min-w-[80px]">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Wynik</div>
          <div className="text-lg font-black">{score}</div>
        </div>
        <button onClick={restart} className="p-3 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors active:scale-95">
          <RotateCcw size={20} className="text-zinc-600" />
        </button>
        <div className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-center min-w-[80px]">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Najlepszy</div>
          <div className="text-lg font-black">{best}</div>
        </div>
      </div>

      {/* GRID */}
      <div
        className="relative bg-[#bbada0] rounded-2xl p-2 m-4 select-none touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ width: 'min(calc(100vw - 3rem), 340px)', aspectRatio: '1/1' }}
      >
        {/* Tło (puste sloty) */}
        <div className="grid grid-cols-4 gap-2 absolute inset-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bg-[#cdc1b4] rounded-lg" />
          ))}
        </div>

        {/* Kafelki */}
        <div className="grid grid-cols-4 gap-2 relative z-10" style={{ aspectRatio: '1/1' }}>
          <AnimatePresence mode="popLayout">
            {grid.flatMap((row, r) =>
              row.map((v, c) => {
                if (v === 0) return <div key={`${r}-${c}`} className="aspect-square" />;
                const colors = TILE_COLORS[v] || TILE_COLORS[4096];
                const fontSize = v >= 1024 ? 'text-lg' : v >= 128 ? 'text-xl' : 'text-2xl';
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    layout
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`aspect-square rounded-lg flex items-center justify-center font-black ${fontSize}`}
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {v}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* GAME OVER / WIN overlay */}
        {(gameOver || (won && !wonAcked)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: gameOver ? 'rgba(0,0,0,0.6)' : 'rgba(237, 197, 63, 0.8)' }}
          >
            <Trophy size={48} className="text-white drop-shadow-lg" />
            <h3 className="text-3xl font-black text-white italic drop-shadow-md">
              {gameOver ? 'KONIEC!' : 'BRAWO!'}
            </h3>
            {won && !wonAcked && (
              <button
                onClick={() => setWonAcked(true)}
                className="px-6 py-3 bg-white text-zinc-900 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
              >
                GRAJ DALEJ
              </button>
            )}
            {gameOver && (
              <button
                onClick={restart}
                className="px-6 py-3 bg-white text-zinc-900 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
              >
                OD NOWA
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* FOOTER */}
      <div className="w-full bg-zinc-100 p-3 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-zinc-200">
        Przesuń kafelki strzałkami lub palcem 🎯
      </div>
    </div>
  );
}
