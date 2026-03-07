'use client';

import React, { useEffect, useState } from 'react';
import { MoveLeft, RotateCcw, Trophy, Play, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useBubbleShooter,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './useBubbleShooter';

export default function BubbleShooter() {
  const [playerName, setPlayerName] = useState('');
  const {
    canvasRef,
    isStarted,
    gameOver,
    score,
    level,
    misses,
    rewardMsg,
    rankingData,
    rankingStatusMessage,
    isSubmittingScore,
    initGame,
    swapBalls,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
    handleCanvasTouchStart,
    handleCanvasTouchMove,
    handleCanvasTouchEnd,
  } = useBubbleShooter(playerName);

  // localStorage nicka (tak jak w oryginale)
  useEffect(() => {
    const savedName = localStorage.getItem('urwis_bubble_nickname');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  useEffect(() => {
    if (playerName.trim().length >= 3) {
      localStorage.setItem('urwis_bubble_nickname', playerName.trim());
    }
  }, [playerName]);

  return (
    <div
      className="relative flex flex-col items-center justify-center bg-black/80 font-sans w-full h-[100dvh] overflow-hidden overscroll-none touch-none scale-100 p-0 m-0 select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        swapBalls();
      }}
    >
      {/* HUD */}
      <div className="absolute top-0 w-full max-w-[500px] flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none">
        <div
          className="flex bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 items-center gap-2 pointer-events-auto cursor-pointer"
          onClick={() => (window.location.href = '/strefa-zabawy')}
        >
          <MoveLeft className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
        </div>
        <div className="flex bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 items-center gap-2">
          <Trophy className="w-4 h-4 text-[#ffd700]" />
          <span className="text-white font-bold tracking-wider">{score}</span>
        </div>
        <div className="flex bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
          <span className="text-white/80 font-medium text-sm">
            LVL <span className="text-white font-bold">{level}</span>
          </span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block bg-[#1a1c29] shadow-2xl md:rounded-xl w-full h-full max-h-[100dvh] md:max-h-[85vh] md:max-w-md object-contain border border-white/5 active:cursor-crosshair touch-none"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
      />

      {/* Przycisk SWAP */}
      {isStarted && !gameOver && (
        <div className="absolute bottom-[4%] right-[4%] z-20 flex flex-col items-end gap-1">
          <Button
            onClick={swapBalls}
            className="rounded-full h-12 bg-indigo-500/80 hover:bg-indigo-400 backdrop-blur-md border border-white/20 active:scale-95 transition-all text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] font-black uppercase tracking-widest select-none flex items-center gap-2 px-5"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm">Zamień</span>
          </Button>
          <span className="hidden lg:block text-[9px] text-white/40 font-bold uppercase mr-2 tracking-widest">
            (Spacja / PPM)
          </span>
        </div>
      )}

      {/* Licznik pudeł */}
      {isStarted && !gameOver && (
        <div className="absolute bottom-[18%] left-[4%] z-20 flex flex-col items-start gap-1 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
          <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest mb-1.5 leading-none">
            Pudła do opuszczenia:
          </span>
          <div className="flex gap-2 w-full justify-between items-center px-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300 border border-black/50 shadow-inner',
                  i < misses
                    ? 'bg-red-500 scale-125 shadow-[0_0_12px_rgba(239,68,68,0.9)] border-red-400/50'
                    : 'bg-white/10',
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ekran startowy */}
      {!isStarted && (
        <Card className="absolute bg-[#1a1c29]/95 backdrop-blur-md border-indigo-500/30 p-8 flex flex-col items-center justify-center shadow-2xl z-20 rounded-2xl w-[90%] max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            <Play className="w-10 h-10 text-white ml-2" />
          </div>
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Kulki
          </h2>
          <p className="text-zinc-300 text-sm mb-6 max-w-[250px] text-center font-medium">
            Połącz 3 takie same. Odbijaj od ścian. Nie dopuść do uderzenia w dno.
          </p>

          <div className="w-full mb-6 relative z-50 pointer-events-auto">
            <label className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-2 block ml-1">
              Twój pseudonim
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Wpisz nick na ranking..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              maxLength={15}
            />
            {playerName.trim().length > 0 && playerName.trim().length < 3 && (
              <p className="text-xs text-red-400 mt-2 ml-1">
                Nick musi mieć minimum 3 znaki.
              </p>
            )}
          </div>

          <Button
            size="lg"
            onClick={initGame}
            disabled={playerName.trim().length < 3}
            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all outline-none mb-3"
          >
            START
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl font-medium"
            onClick={() => (window.location.href = '/strefa-zabawy')}
          >
            Wróć do Strefy Zabawy
          </Button>
        </Card>
      )}

      {/* Game Over + ranking */}
      {gameOver && (
        <Card className="absolute top-0 left-0 w-full h-[100dvh] bg-[#1a1c29]/95 backdrop-blur-md border-0 p-6 flex flex-col shadow-none z-30 rounded-none touch-none overscroll-none overflow-hidden">
          <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto py-10 flex flex-col items-center">
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-sm border border-red-500/30">
              <AlertCircle className="w-4 h-4" /> Game Over
            </div>

            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-1">
              {score}
            </h2>
            <p className="text-zinc-400 font-medium mb-6">
              Zdobyte punkty (Lvl {level})
            </p>

            {rewardMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-center text-sm font-medium w-full">
                {rewardMsg}
              </div>
            )}

            <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-4 mb-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
              <h3 className="font-bold text-white mb-3 text-lg flex items-center justify-between">
                Top 10 wyników
                <Trophy className="w-4 h-4 text-[#ffd700]" />
              </h3>

              {isSubmittingScore ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : (
                <>
                  {rankingStatusMessage && (
                    <div
                      className={cn(
                        'text-center text-sm font-bold py-2 px-3 rounded-lg mb-4 border',
                        rankingStatusMessage.includes('Brawo')
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
                      )}
                    >
                      {rankingStatusMessage}
                    </div>
                  )}

                  {rankingData.length > 0 ? (
                    <div className="max-h-[220px] overflow-y-auto pr-2">
                      {rankingData.map((row: any, idx: number) => (
                        <div
                          key={row.id ?? `${row.playername}-${idx}`}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg text-sm mb-1 transition-all',
                            idx === 0
                              ? 'bg-amber-500/20 border border-amber-500/30 font-bold text-amber-400'
                              : idx === 1
                              ? 'bg-zinc-300/20 border border-zinc-300/30 font-bold text-zinc-300'
                              : idx === 2
                              ? 'bg-orange-700/20 border border-orange-700/30 font-bold text-orange-400'
                              : row.playername === playerName && row.score === score
                                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold'
                                : 'bg-white/5 text-white shadow-sm font-medium',

                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center opacity-50 font-mono text-xs">
                              {idx + 1}.
                            </span>
                            <span className="truncate max-w-[120px]">
  {row.playername ?? row.player_name ?? row.nickname ?? 'Anonim'}
</span>

                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-50">lvl {row.level}</span>
                            <span className="tabular-nums">{row.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-white/40 text-sm">
                      Brak wyników. Zagraj, aby zapisać pierwszy rekord.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="w-full grid gap-3 pb-8 mt-auto flex-shrink-0">
              <Button
                onClick={initGame}
                disabled={isSubmittingScore}
                className="w-full h-14 bg-white hover:bg-zinc-200 text-zinc-900 font-black text-lg rounded-xl"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Zagraj ponownie
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl font-medium"
                onClick={() => (window.location.href = '/strefa-zabawy')}
              >
                Wyjdź do menu
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
