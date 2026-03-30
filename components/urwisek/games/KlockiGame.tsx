'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Play, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useKlocki,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './useKlocki';
import { RankingItem } from '@/types/urwis';

export default function KlockiGame() {
  const [playerName, setPlayerName] = useState('');
  const {
    canvasRef,
    isStarted,
    gameOver,
    score,
    bestScore,
    streak,
    rerollsLeft,
    rewardMsg,
    rankingData,
    rankingStatusMessage,
    isSubmittingScore,
    initGame,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    rerollDeck,
    comboMessage,
  } = useKlocki(playerName);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('urwis_klocki_nick');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setPlayerName(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (playerName.trim().length >= 3) {
      try {
        localStorage.setItem('urwis_klocki_nick', playerName.trim());
      } catch {}
    }
  }, [playerName]);

  return (
    <div
      className="relative flex flex-col items-center justify-center bg-[#050712] text-white w-full h-[100dvh] overflow-hidden overscroll-none touch-none select-none"
    >
      {comboMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-xs font-black tracking-[0.2em] uppercase shadow-lg animate-bounce">
          {comboMessage}
        </div>
      )}
      {/* HUD */}
      <div className="absolute top-0 w-full max-w-[520px] flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none">
        <div
          className="flex bg-white/80 hover:bg-white backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 items-center gap-2 pointer-events-auto cursor-pointer text-zinc-700 hover:text-[#BF2024] transition-all group shadow-md"
          onClick={() => (window.location.href = '/strefa-zabawy')}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {streak >= 2 && (
            <div className="flex bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1 border border-amber-400 items-center gap-1 animate-bounce text-[10px] font-black text-white shadow-md">
              🔥 COMBO x{streak}
            </div>
          )}
          <div className="flex bg-black/60 rounded-full px-3 py-1.5 border border-white/10 items-center gap-1">
            <Trophy className="w-4 h-4 text-[#ffd700]" />
            <span className="text-white font-bold tracking-widest text-sm tabular-nums">
              {score}
            </span>
          </div>
          <div className="flex bg-black/40 rounded-full px-3 py-1.5 border border-white/5 items-center gap-1">
            <span className="text-xs text-zinc-300">BEST</span>
            <span className="text-white font-semibold tabular-nums text-sm">
              {bestScore}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block bg-[#0f111a] shadow-[0_0_60px_rgba(15,23,42,0.9)] rounded-3xl w-full max-w-[520px] max-h-[88vh] border border-white/5 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      />

      {isStarted && !gameOver && (
        <div className="mt-4 flex gap-2 w-full max-w-[520px] px-4 pointer-events-auto z-10">
          <Button
            variant="outline"
            disabled={rerollsLeft <= 0}
            onClick={rerollDeck}
            className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-2xl text-xs sm:text-sm h-12 backdrop-blur-md bg-black/30 flex items-center gap-2 justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            Przetasuj talię ({rerollsLeft})
          </Button>
        </div>
      )}

      {/* Ekran startowy */}
      {!isStarted && (
        <Card className="absolute bg-[#020617]/95 backdrop-blur-md border-indigo-500/30 p-8 flex flex-col items-center justify-center shadow-2xl z-20 rounded-2xl w-[90%] max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-[#bf2024] via-[#22c55e] to-[#0055ff] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(56,189,248,0.6)]">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
          <h2 className="text-3xl font-black text-center mb-2 tracking-tight">
            KLOCKI URWISA
          </h2>
          <p className="text-zinc-300 text-sm mb-6 max-w-[260px] text-center font-medium">
            Układaj klocki na planszy 9×9. Czyść całe wiersze, kolumny i kwadraty 3×3,
            żeby zgarniać punkty i bić rekordy.
          </p>

          <div className="w-full mb-6">
            <label className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-2 block ml-1">
              Twój pseudonim
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Wpisz nick na ranking..."
              maxLength={15}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            {playerName.trim().length > 0 &&
              playerName.trim().length < 3 && (
                <p className="text-xs text-red-400 mt-2 ml-1">
                  Nick musi mieć minimum 3 znaki.
                </p>
              )}
          </div>

          <Button
            size="lg"
            onClick={initGame}
            disabled={playerName.trim().length < 3}
            className="w-full h-14 bg-gradient-to-r from-[#bf2024] via-[#f97316] to-[#22c55e] hover:from-[#f97316] hover:via-[#22c55e] hover:to-[#0ea5e9] text-white font-black text-lg rounded-xl shadow-lg hover:shadow-[#22c55e]/40 transition-all outline-none mb-3 tracking-widest"
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

      {/* Game Over + ranking (prosty, podłączysz do Supabase jak w bubble) */}
      {gameOver && (
        <Card className="absolute top-0 left-0 w-full h-[100dvh] bg-[#020617]/95 backdrop-blur-md border-0 p-6 flex flex-col shadow-none z-30 rounded-none touch-none overscroll-none overflow-hidden">
          <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto py-10 flex flex-col items-center">
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-sm border border-red-500/30">
              <AlertCircle className="w-4 h-4" /> Koniec gry
            </div>

            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-1">
              {score}
            </h2>
            <p className="text-zinc-400 font-medium mb-6">
              Twój wynik w Klockach
            </p>

            {rewardMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-center text-sm font-medium w-full">
                {rewardMsg}
              </div>
            )}

            {/* Placeholder na ranking (pod Supabase) */}
            <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-4 mb-6 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent opacity-60" />
              <h3 className="font-bold text-white mb-3 text-lg flex items-center justify-between">
                Top wyniki
                <Trophy className="w-4 h-4 text-[#ffd700]" />
              </h3>

              {isSubmittingScore ? (
                <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
                  Wczytywanie rankingu...
                </div>
              ) : (
                <>
                  {rankingStatusMessage && (
                    <div
                      className={cn(
                        'text-center text-sm font-bold py-2 px-3 rounded-lg mb-4 border',
                        rankingStatusMessage.includes('Brawo')
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
                      )}
                    >
                      {rankingStatusMessage}
                    </div>
                  )}

                  {rankingData.length > 0 ? (
                    <div className="max-h-[220px] overflow-y-auto pr-2">
                      {rankingData.map((row: RankingItem, idx: number) => (
                        <div
                          key={row.id ?? `${row.player_name}-${idx}`}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg text-sm mb-1 transition-all bg-white/5 text-white shadow-sm font-medium',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center opacity-50 font-mono text-xs">
                              {idx + 1}.
                            </span>
                            <span className="truncate max-w-[120px]">
                              {row.player_name ?? 'Anonim'}
                            </span>
                          </div>
                          <span className="tabular-nums">{row.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-white/40 text-sm font-medium">
                      Urwis wczytuje ranking...
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="w-full grid gap-3 pb-8 mt-auto flex-shrink-0">
              <Button
                onClick={initGame}
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
