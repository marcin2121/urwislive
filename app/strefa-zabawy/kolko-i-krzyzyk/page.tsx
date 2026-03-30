"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Smile,  Trophy, Skull } from "lucide-react";

type Player = 'X' | 'O' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToePage() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  const checkWinner = (squares: Player[]): Player | 'Draw' => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getAIMove = (squares: Player[]): number => {
    const availableMoves = squares.map((sq, i) => sq === null ? i : null).filter(val => val !== null) as number[];
    if (availableMoves.length === 0) return -1;

    // Easy mode: Completely random
    if (difficulty === 'easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Medium mode: 40% random, 60% best move
    if (difficulty === 'medium' && Math.random() < 0.4) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Hard mode (or 60% of medium): Minimax
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timeout = setTimeout(() => {
        const aiMove = getAIMove([...board]);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            if (gameWinner === 'O') setScores(s => ({ ...s, ai: s.ai + 1 }));
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 600);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, board, winner]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') setScores(s => ({ ...s, player: s.player + 1 }));
      if (gameWinner === 'Draw') {
        // Draw logic if needed
      }
    } else {
      setIsPlayerTurn(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-32 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/strefa-zabawy" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white text-zinc-600 hover:text-[#BF2024] shadow-sm backdrop-blur-md rounded-full transition-all font-black uppercase tracking-widest text-xs border border-white/50 group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Strefy Zabawy
        </Link>

        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-2 pr-8 pb-2 pl-1 text-center md:text-left leading-tight">
          Kółko i <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 pr-8">Krzyżyk</span>
        </h1>
        <p className="text-zinc-500 font-medium mb-12 text-center md:text-left text-lg max-w-2xl px-2">
          Zagraj w klasyczną grę przeciwko Urwisowi. Wybierz poziom trudności i udowodnij swoją przewagę!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Panel Boczny */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full"></div>
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-4">Wynik</h3>
              <div className="flex items-center justify-between text-2xl font-black uppercase italic tracking-tighter">
                <div className="flex flex-col items-center">
                  <span className="text-yellow-500 flex items-center gap-2 text-xl">⭐ Ty</span>
                  <span className="text-4xl text-zinc-900">{scores.player}</span>
                </div>
                <div className="text-zinc-300">-</div>
                <div className="flex flex-col items-center">
                  <span className="text-red-500 flex items-center gap-2 text-xl">🦖 Urwis</span>
                  <span className="text-4xl text-zinc-900">{scores.ai}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-4">Poziom trudności</h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'easy', label: 'Urwis się uczy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
                  { id: 'medium', label: 'Sprytny Urwis', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { id: 'hard', label: 'Mistrz Urwis', icon: Skull, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => { setDifficulty(level.id as Difficulty); resetGame(); }}
                    className={`flex items-center gap-3 p-3 rounded-2xl w-full transition-all border-2 text-left
                      ${difficulty === level.id 
                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-md z-10' 
                        : 'border-transparent hover:bg-zinc-50 hover:scale-100 opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${level.bg}`}>
                      <level.icon size={20} className={level.color} />
                    </div>
                    <span className="font-black italic uppercase tracking-tight text-zinc-900">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 outline-none"
            >
              <RotateCcw size={18} /> Resetuj pole
            </button>
          </div>

          {/* Główna Plansza (Game Board) */}
          <div className="md:col-span-8 flex justify-center">
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border-4 border-white inline-block relative backdrop-blur-3xl bg-white/60">
              
              <AnimatePresence>
                {winner && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center"
                  >
                    {winner === 'X' && (
                      <div className="animate-bounce mb-4 text-7xl drop-shadow-sm">⭐</div>
                    )}
                    {winner === 'O' && (
                      <div className="animate-pulse mb-4 text-7xl drop-shadow-sm">🦖</div>
                    )}
                    
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">
                       {winner === 'Draw' ? 'Remis!' : winner === 'X' ? 'Wygrywasz!' : 'Przegrana'}
                    </h2>
                    <p className="text-zinc-500 font-medium mb-8">
                       {winner === 'Draw' ? 'Nikt nie okazał się lepszy. Świetny pojedynek!' : winner === 'X' ? 'Oj, jesteś ode mnie lepszy! Gratulacje!' : 'Haha, tym razem ja wygrywam! Spróbujesz jeszcze raz?'}
                    </p>

                    <button
                      onClick={resetGame}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-black uppercase italic tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 outline-none"
                    >
                      Zagraj ponownie <RotateCcw size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-2 md:gap-4 relative z-10 w-full max-w-[400px]">
                {board.map((cell, index) => (
                  <motion.button
                    key={index}
                    whileHover={!cell && !winner && isPlayerTurn ? { scale: 0.95 } : {}}
                    whileTap={!cell && !winner && isPlayerTurn ? { scale: 0.9 } : {}}
                    onClick={() => handleCellClick(index)}
                    className={`aspect-square w-20 sm:w-24 md:w-32 rounded-2xl flex items-center justify-center text-5xl md:text-6xl shadow-inner transition-colors outline-none
                      ${!cell && !winner && isPlayerTurn ? 'bg-zinc-100 hover:bg-zinc-200 cursor-pointer' : 'bg-zinc-50 cursor-default'}
                      ${cell === 'X' ? 'text-yellow-500 shadow-yellow-100' : ''}
                      ${cell === 'O' ? 'text-red-500 shadow-red-100' : ''}
                    `}
                  >
                    <AnimatePresence>
                      {cell && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                          {cell === 'X' ? <span className="text-6xl md:text-7xl drop-shadow-sm">⭐</span> : <span className="text-6xl md:text-7xl drop-shadow-sm">🦖</span>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
