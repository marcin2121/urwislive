"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useIsTouch } from '@/hooks/useIsTouch';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// 🍬 STAŁE
// ═══════════════════════════════════════════════════════════

const GRID_SIZE = 8;
const TILE_SIZE = 42;
const GAP = 2;
const NUM_TYPES = 6;

const TILE_EMOJIS = ['🍭', '🧸', '🎈', '⭐', '🎀', '💎'];
const TILE_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'];

type Grid = number[][];
type Pos = { row: number; col: number };

function createGrid(): Grid {
  const grid: Grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let type: number;
      do {
        type = Math.floor(Math.random() * NUM_TYPES);
      } while (
        (c >= 2 && row[c - 1] === type && row[c - 2] === type) ||
        (r >= 2 && grid[r - 1]?.[c] === type && grid[r - 2]?.[c] === type)
      );
      row.push(type);
    }
    grid.push(row);
  }
  return grid;
}

function findMatches(grid: Grid): Set<string> {
  const matches = new Set<string>();

  // Horizontal
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      if (grid[r][c] >= 0 && grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2]) {
        matches.add(`${r},${c}`);
        matches.add(`${r},${c + 1}`);
        matches.add(`${r},${c + 2}`);
      }
    }
  }

  // Vertical
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < GRID_SIZE - 2; r++) {
      if (grid[r][c] >= 0 && grid[r][c] === grid[r + 1][c] && grid[r][c] === grid[r + 2][c]) {
        matches.add(`${r},${c}`);
        matches.add(`${r + 1},${c}`);
        matches.add(`${r + 2},${c}`);
      }
    }
  }

  return matches;
}

function removeAndDrop(grid: Grid, matches: Set<string>): Grid {
  const g = grid.map(r => [...r]);

  // Remove
  for (const key of matches) {
    const [r, c] = key.split(',').map(Number);
    g[r][c] = -1;
  }

  // Drop
  for (let c = 0; c < GRID_SIZE; c++) {
    let writeRow = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (g[r][c] >= 0) {
        g[writeRow][c] = g[r][c];
        if (writeRow !== r) g[r][c] = -1;
        writeRow--;
      }
    }
    // Fill top
    for (let r = writeRow; r >= 0; r--) {
      g[r][c] = Math.floor(Math.random() * NUM_TYPES);
    }
  }

  return g;
}

function areAdjacent(a: Pos, b: Pos): boolean {
  return (Math.abs(a.row - b.row) + Math.abs(a.col - b.col)) === 1;
}

// ═══════════════════════════════════════════════════════════
// 🎮 KOMPONENT
// ═══════════════════════════════════════════════════════════

export default function Match3Game() {
  const isTouch = useIsTouch();
  const [grid, setGrid] = useState<Grid>(createGrid);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [popCells, setPopCells] = useState<Set<string>>(new Set());
  const processingRef = useRef(false);

  const processMatches = useCallback((g: Grid, isChain = false) => {
    const matches = findMatches(g);
    if (matches.size === 0) {
      setAnimating(false);
      processingRef.current = false;
      return;
    }

    setPopCells(matches);
    setScore(s => s + matches.size * 10 * (isChain ? 2 : 1));

    setTimeout(() => {
      const newGrid = removeAndDrop(g, matches);
      setGrid(newGrid);
      setPopCells(new Set());

      setTimeout(() => {
        processMatches(newGrid, true);
      }, 300);
    }, 400);
  }, []);

  const handleSwap = useCallback((a: Pos, b: Pos) => {
    if (animating || processingRef.current || gameOver) return;

    const g = grid.map(r => [...r]);
    [g[a.row][a.col], g[b.row][b.col]] = [g[b.row][b.col], g[a.row][a.col]];

    const matches = findMatches(g);
    if (matches.size > 0) {
      setGrid(g);
      setMoves(m => {
        const newMoves = m - 1;
        if (newMoves <= 0) setTimeout(() => setGameOver(true), 1000);
        return newMoves;
      });
      setAnimating(true);
      processingRef.current = true;

      setTimeout(() => processMatches(g), 200);
    }
    // else: invalid swap, do nothing
  }, [grid, animating, gameOver, processMatches]);

  const handleClick = useCallback((pos: Pos) => {
    if (animating || gameOver) return;

    if (!selected) {
      setSelected(pos);
      return;
    }

    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }

    if (areAdjacent(selected, pos)) {
      handleSwap(selected, pos);
      setSelected(null);
    } else {
      setSelected(pos);
    }
  }, [selected, animating, gameOver, handleSwap]);

  // Touch swipe
  const touchStart = useRef<Pos & { clientX: number; clientY: number } | null>(null);
  const onTouchStart = (row: number, col: number, e: React.TouchEvent) => {
    touchStart.current = { row, col, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || animating || gameOver) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.clientX;
    const dy = e.changedTouches[0].clientY - touchStart.current.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;

    const { row, col } = touchStart.current;
    let target: Pos;
    if (Math.abs(dx) > Math.abs(dy)) {
      target = { row, col: col + (dx > 0 ? 1 : -1) };
    } else {
      target = { row: row + (dy > 0 ? 1 : -1), col };
    }

    if (target.row >= 0 && target.row < GRID_SIZE && target.col >= 0 && target.col < GRID_SIZE) {
      handleSwap({ row, col }, target);
    }
    touchStart.current = null;
  };

  const restart = () => {
    setGrid(createGrid());
    setSelected(null);
    setScore(0);
    setMoves(30);
    setGameOver(false);
    setAnimating(false);
    setPopCells(new Set());
  };

  // Initial auto-clear
  useEffect(() => {
    const matches = findMatches(grid);
    if (matches.size > 0) {
      setAnimating(true);
      processingRef.current = true;
      setTimeout(() => processMatches(grid), 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const boardW = GRID_SIZE * (TILE_SIZE + GAP) + GAP;

  return (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      <div className="w-full bg-gradient-to-r from-pink-500 to-rose-600 p-5 text-white text-center shadow-md z-10">
        <h2 className="text-2xl font-black italic tracking-wider flex items-center justify-center gap-2">
          <Sparkles size={26} /> TRZY W RZĄD
        </h2>
      </div>

      <div className="w-full flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-100">
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Wynik</div>
          <div className="text-lg font-black text-zinc-900">{score}</div>
        </div>
        <button onClick={restart} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200">
          <RotateCcw size={18} />
        </button>
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Ruchy</div>
          <div className={`text-lg font-black ${moves <= 5 ? 'text-red-500' : 'text-zinc-900'}`}>{moves}</div>
        </div>
      </div>

      <div
        className="relative bg-zinc-100 rounded-2xl m-4 select-none touch-none"
        style={{ width: boardW, height: boardW }}
        onTouchEnd={onTouchEnd}
      >
        {grid.map((row, r) =>
          row.map((type, c) => {
            const key = `${r},${c}`;
            const isSelected = selected?.row === r && selected?.col === c;
            const isPopping = popCells.has(key);

            return (
              <motion.button
                key={`${r}-${c}`}
                onClick={() => handleClick({ row: r, col: c })}
                onTouchStart={(e) => onTouchStart(r, c, e)}
                animate={{
                  scale: isPopping ? 0 : isSelected ? 1.15 : 1,
                  opacity: isPopping ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute flex items-center justify-center rounded-xl cursor-pointer transition-shadow"
                style={{
                  left: c * (TILE_SIZE + GAP) + GAP,
                  top: r * (TILE_SIZE + GAP) + GAP,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: TILE_COLORS[type] || '#d4d4d8',
                  boxShadow: isSelected ? `0 0 0 3px #fff, 0 0 16px ${TILE_COLORS[type]}` : 'inset 0 -2px 4px rgba(0,0,0,0.2)',
                  fontSize: 20,
                }}
              >
                {TILE_EMOJIS[type]}
              </motion.button>
            );
          })
        )}

        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 rounded-2xl z-10">
            <Trophy size={48} className="text-yellow-400" />
            <p className="text-white font-black text-2xl italic">KONIEC!</p>
            <p className="text-zinc-300 font-bold">{score} punktów</p>
            <button onClick={restart} className="px-6 py-3 bg-white text-zinc-900 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
              OD NOWA
            </button>
          </motion.div>
        )}
      </div>

      <div className="w-full bg-zinc-100 p-3 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-zinc-200">
        {isTouch ? 'Przesuń palcem po kafelku, by zamienić 🍬' : 'Kliknij dwa sąsiednie kafelki, by zamienić 🍬'}
      </div>
    </div>
  );
}
