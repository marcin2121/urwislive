"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Pause, Play } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// ═══════════════════════════════════════════════════════════
// 🧱 STAŁE
// ═══════════════════════════════════════════════════════════

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 28;

const SHAPES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1,1,1,1]], color: '#06b6d4' },
  O: { shape: [[1,1],[1,1]], color: '#eab308' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#8b5cf6' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#22c55e' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#ef4444' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#3b82f6' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f97316' },
};

const SHAPE_KEYS = Object.keys(SHAPES);

type Board = (string | null)[][];

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  return { shape: SHAPES[key].shape.map(r => [...r]), color: SHAPES[key].color };
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      rotated[c][rows - 1 - r] = shape[r][c];
  return rotated;
}

function isValid(board: Board, shape: number[][], row: number, col: number): boolean {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
        if (board[nr][nc]) return false;
      }
  return true;
}

function placePiece(board: Board, shape: number[][], row: number, col: number, color: string): Board {
  const b = board.map(r => [...r]);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) b[row + r][col + c] = color;
  return b;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const cleared = ROWS - newBoard.length;
  while (newBoard.length < ROWS) newBoard.unshift(Array(COLS).fill(null));
  return { board: newBoard, cleared };
}

// ═══════════════════════════════════════════════════════════
// 🎮 KOMPONENT
// ═══════════════════════════════════════════════════════════

export default function TetrisGame() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [pos, setPos] = useState({ row: 0, col: 3 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const posRef = useRef(pos);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);
  useEffect(() => { posRef.current = pos; }, [pos]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { setWindowSize({ width: window.innerWidth, height: window.innerHeight }); }, []);

  const drop = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const { row, col } = posRef.current;
    const p = pieceRef.current;
    const b = boardRef.current;

    if (isValid(b, p.shape, row + 1, col)) {
      setPos({ row: row + 1, col });
    } else {
      // Place piece
      let newBoard = placePiece(b, p.shape, row, col, p.color);
      const { board: clearedBoard, cleared } = clearLines(newBoard);
      newBoard = clearedBoard;
      setBoard(newBoard);

      if (cleared > 0) {
        const pts = [0, 100, 300, 500, 800][cleared] || 0;
        setScore(s => s + pts * level);
        setLines(l => {
          const newLines = l + cleared;
          setLevel(Math.floor(newLines / 10) + 1);
          return newLines;
        });
      }

      // New piece
      const np = randomPiece();
      if (!isValid(newBoard, np.shape, 0, 3)) {
        setGameOver(true);
        return;
      }
      setPiece(np);
      setPos({ row: 0, col: 3 });
    }
  }, [level]);

  // Auto-drop
  useEffect(() => {
    if (gameOver) return;
    const speed = Math.max(100, 800 - (level - 1) * 70);
    const interval = setInterval(drop, speed);
    return () => clearInterval(interval);
  }, [drop, level, gameOver]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setPaused(p => !p); return; }
      if (pausedRef.current) return;

      const p = pieceRef.current;
      const { row, col } = posRef.current;
      const b = boardRef.current;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          if (isValid(b, p.shape, row, col - 1)) setPos({ row, col: col - 1 });
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          if (isValid(b, p.shape, row, col + 1)) setPos({ row, col: col + 1 });
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          drop();
          break;
        case 'ArrowUp':
        case 'w': {
          e.preventDefault();
          const rotated = rotate(p.shape);
          if (isValid(b, rotated, row, col)) setPiece({ ...p, shape: rotated });
          else if (isValid(b, rotated, row, col - 1)) { setPiece({ ...p, shape: rotated }); setPos({ row, col: col - 1 }); }
          else if (isValid(b, rotated, row, col + 1)) { setPiece({ ...p, shape: rotated }); setPos({ row, col: col + 1 }); }
          break;
        }
        case ' ':
          e.preventDefault();
          // Hard drop
          let dr = row;
          while (isValid(b, p.shape, dr + 1, col)) dr++;
          setPos({ row: dr, col });
          setTimeout(drop, 50);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drop]);

  // Touch
  const touchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || gameOver || paused) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.time;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && dt < 300) {
      // Tap = rotate
      const p = pieceRef.current;
      const { row, col } = posRef.current;
      const rotated = rotate(p.shape);
      if (isValid(boardRef.current, rotated, row, col)) setPiece({ ...p, shape: rotated });
    } else if (Math.abs(dx) > Math.abs(dy)) {
      const p = pieceRef.current;
      const { row, col } = posRef.current;
      const nc = col + (dx > 0 ? 1 : -1);
      if (isValid(boardRef.current, p.shape, row, nc)) setPos({ row, col: nc });
    } else if (dy > 30) {
      drop();
    }
    touchRef.current = null;
  };

  const restart = () => {
    setBoard(createBoard());
    setPiece(randomPiece());
    setPos({ row: 0, col: 3 });
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
  };

  // Render board with current piece
  const displayBoard = board.map(r => [...r]);
  if (!gameOver) {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c] && pos.row + r >= 0 && pos.row + r < ROWS)
          displayBoard[pos.row + r][pos.col + c] = piece.color;
  }

  // Ghost piece
  if (!gameOver && !paused) {
    let gr = pos.row;
    while (isValid(board, piece.shape, gr + 1, pos.col)) gr++;
    if (gr !== pos.row) {
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++)
          if (piece.shape[r][c] && !displayBoard[gr + r]?.[pos.col + c])
            displayBoard[gr + r][pos.col + c] = piece.color + '30';
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      {gameOver && score > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}

      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white text-center shadow-md z-10">
        <h2 className="text-3xl font-black italic tracking-wider">TETRIS</h2>
      </div>

      <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Wynik</div>
          <div className="text-lg font-black text-zinc-900">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Linie</div>
          <div className="text-lg font-black text-zinc-900">{lines}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPaused(p => !p)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200">
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button onClick={restart} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200">
            <RotateCcw size={18} />
          </button>
        </div>
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Poziom</div>
          <div className="text-lg font-black text-indigo-600">{level}</div>
        </div>
      </div>

      <div
        className="relative bg-zinc-900 m-4 rounded-xl select-none touch-none border-2 border-zinc-700"
        style={{ width: COLS * CELL_SIZE + 4, height: ROWS * CELL_SIZE + 4 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {displayBoard.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="absolute border border-zinc-800/40"
              style={{
                left: c * CELL_SIZE + 2,
                top: r * CELL_SIZE + 2,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell || 'transparent',
                borderRadius: cell ? 3 : 0,
                boxShadow: cell && !cell.endsWith('30') ? `inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.15)` : undefined,
              }}
            />
          ))
        )}

        {paused && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl z-10">
            <p className="text-white font-black text-2xl italic uppercase tracking-widest">PAUZA</p>
          </div>
        )}

        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 rounded-xl z-10">
            <Trophy size={48} className="text-yellow-400" />
            <p className="text-white font-black text-2xl italic">KONIEC!</p>
            <p className="text-zinc-400 font-bold">{score} punktów</p>
            <button onClick={restart} className="px-6 py-3 bg-white text-zinc-900 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
              OD NOWA
            </button>
          </motion.div>
        )}
      </div>

      <div className="w-full bg-zinc-100 p-3 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-zinc-200">
        Strzałki / WASD + Spacja (hard drop) • P = pauza 🎮
      </div>
    </div>
  );
}
