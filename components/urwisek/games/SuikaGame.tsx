"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { Cherry, Trophy } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// ═══════════════════════════════════════════════════════════
// 🍉 KONFIGURACJA OWOCÓW (od wiśni do arbuza)
// ═══════════════════════════════════════════════════════════

const FRUITS = [
  { radius: 15, color: '#dc2626', name: 'Wiśnia',      score: 1  },
  { radius: 22, color: '#f97316', name: 'Truskawka',   score: 3  },
  { radius: 30, color: '#a855f7', name: 'Winogrono',   score: 6  },
  { radius: 36, color: '#f59e0b', name: 'Pomarańcza',  score: 10 },
  { radius: 45, color: '#ef4444', name: 'Jabłko',      score: 15 },
  { radius: 52, color: '#eab308', name: 'Gruszka',     score: 21 },
  { radius: 60, color: '#f97316', name: 'Brzoskwinia', score: 28 },
  { radius: 70, color: '#fbbf24', name: 'Melon',       score: 36 },
  { radius: 82, color: '#84cc16', name: 'Ananas',      score: 45 },
  { radius: 95, color: '#22c55e', name: 'Dynia',       score: 55 },
  { radius: 110, color: '#16a34a', name: 'Arbuz',      score: 66 },
];

const GAME_W = 380;
const GAME_H = 600;
const WALL_T = 20;
const DROP_Y = 60;
const LOSE_LINE = 100;

// ═══════════════════════════════════════════════════════════
// 🎮 KOMPONENT GRY
// ═══════════════════════════════════════════════════════════

export default function SuikaGame() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const canDropRef = useRef(true);
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(0);
  const previewRef = useRef<Matter.Body | null>(null);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [nextFruit, setNextFruit] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const saved = localStorage.getItem('urwis-suika-hs');
    if (saved) setHighscore(parseInt(saved));
  }, []);

  const addScore = useCallback((sizeIndex: number) => {
    scoreRef.current += FRUITS[sizeIndex].score;
    setScore(scoreRef.current);
  }, []);

  // ──────── INICJALIZACJA MATTER.JS ────────
  useEffect(() => {
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width: GAME_W,
        height: GAME_H,
        wireframes: false,
        background: '#fff7ed',
      },
    });

    const runner = Matter.Runner.create();

    // Ściany
    const walls = [
      Matter.Bodies.rectangle(GAME_W / 2, GAME_H + WALL_T / 2, GAME_W + WALL_T * 2, WALL_T, { 
        isStatic: true, render: { fillStyle: '#d4d4d8' }
      }),
      Matter.Bodies.rectangle(-WALL_T / 2, GAME_H / 2, WALL_T, GAME_H, { 
        isStatic: true, render: { fillStyle: '#d4d4d8' }
      }),
      Matter.Bodies.rectangle(GAME_W + WALL_T / 2, GAME_H / 2, WALL_T, GAME_H, { 
        isStatic: true, render: { fillStyle: '#d4d4d8' }
      }),
    ];
    Matter.Composite.add(engine.world, walls);

    // Losowy pierwszy i następny owoc
    currentIndexRef.current = Math.floor(Math.random() * 5);
    nextIndexRef.current = Math.floor(Math.random() * 5);
    setNextFruit(nextIndexRef.current);

    // Preview ball
    const fruit = FRUITS[currentIndexRef.current];
    const preview = Matter.Bodies.circle(GAME_W / 2, DROP_Y, fruit.radius, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: fruit.color },
      collisionFilter: { mask: 0 },
    });
    (preview as any).sizeIndex = currentIndexRef.current;
    previewRef.current = preview;
    Matter.Composite.add(engine.world, preview);

    // ──────── KOLIZJE (łączenie owoców) ────────
    Matter.Events.on(engine, 'collisionStart', (event) => {
      if (gameOverRef.current) return;
      
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyA.isStatic || bodyB.isStatic) continue;
        if ((bodyA as any).sizeIndex === undefined || (bodyB as any).sizeIndex === undefined) continue;
        if ((bodyA as any).sizeIndex !== (bodyB as any).sizeIndex) continue;
        if ((bodyA as any).merged || (bodyB as any).merged) continue;

        const sIdx = (bodyA as any).sizeIndex as number;
        if (sIdx >= FRUITS.length - 1) continue; // arbuz nie ewoluuje dalej

        (bodyA as any).merged = true;
        (bodyB as any).merged = true;

        const newIdx = sIdx + 1;
        const mx = (bodyA.position.x + bodyB.position.x) / 2;
        const my = (bodyA.position.y + bodyB.position.y) / 2;

        Matter.Composite.remove(engine.world, [bodyA, bodyB]);

        const newFruit = FRUITS[newIdx];
        const merged = Matter.Bodies.circle(mx, my, newFruit.radius, {
          friction: 0.005,
          frictionStatic: 0.005,
          restitution: 0.2,
          render: { fillStyle: newFruit.color },
        });
        (merged as any).sizeIndex = newIdx;
        (merged as any).merged = false;
        (merged as any).dropTime = Date.now();
        Matter.Composite.add(engine.world, merged);

        addScore(newIdx);
      }
    });

    // ──────── SPRAWDZENIE GAME OVER ────────
    const checkLose = setInterval(() => {
      if (gameOverRef.current) return;

      const bodies = Matter.Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.isStatic) continue;
        if ((body as any).sizeIndex === undefined) continue;
        if (Date.now() - ((body as any).dropTime || Date.now()) < 2000) continue;

        if (body.position.y - (body.circleRadius || 0) < LOSE_LINE) {
          gameOverRef.current = true;
          setGameOver(true);
          Matter.Runner.stop(runner);

          // Save highscore
          if (scoreRef.current > (parseInt(localStorage.getItem('urwis-suika-hs') || '0'))) {
            localStorage.setItem('urwis-suika-hs', String(scoreRef.current));
            setHighscore(scoreRef.current);
          }
          break;
        }
      }
    }, 500);

    // ──────── OBSŁUGA MYSZY ────────
    const canvas = render.canvas;

    const getMouseX = (e: MouseEvent | TouchEvent): number => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = GAME_W / rect.width;
      if ('touches' in e) {
        return (e.touches[0].clientX - rect.left) * scaleX;
      }
      return (e.clientX - rect.left) * scaleX;
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (gameOverRef.current || !previewRef.current) return;
      const x = getMouseX(e);
      const fruit = FRUITS[(previewRef.current as any).sizeIndex];
      const clampedX = Math.max(fruit.radius + 2, Math.min(GAME_W - fruit.radius - 2, x));
      Matter.Body.setPosition(previewRef.current, { x: clampedX, y: DROP_Y });
    };

    const onDrop = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (gameOverRef.current || !canDropRef.current || !previewRef.current) return;
      
      canDropRef.current = false;
      const dropX = previewRef.current.position.x;
      const sIdx = currentIndexRef.current;
      const f = FRUITS[sIdx];

      // Usuń preview
      Matter.Composite.remove(engine.world, previewRef.current);

      // Upuść prawdziwy owoc
      const dropped = Matter.Bodies.circle(dropX, DROP_Y, f.radius, {
        friction: 0.005,
        frictionStatic: 0.005,
        restitution: 0.2,
        render: { fillStyle: f.color },
      });
      (dropped as any).sizeIndex = sIdx;
      (dropped as any).merged = false;
      (dropped as any).dropTime = Date.now();
      Matter.Composite.add(engine.world, dropped);

      // Przygotuj następny owoc
      currentIndexRef.current = nextIndexRef.current;
      nextIndexRef.current = Math.floor(Math.random() * 5);
      setNextFruit(nextIndexRef.current);

      setTimeout(() => {
        if (gameOverRef.current) return;
        const nf = FRUITS[currentIndexRef.current];
        const newPreview = Matter.Bodies.circle(dropX, DROP_Y, nf.radius, {
          isStatic: true,
          isSensor: true,
          render: { fillStyle: nf.color },
          collisionFilter: { mask: 0 },
        });
        (newPreview as any).sizeIndex = currentIndexRef.current;
        previewRef.current = newPreview;
        Matter.Composite.add(engine.world, newPreview);
        canDropRef.current = true;
      }, 400);
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onDrop);
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onDrop);

    // Run
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    // ──────── RYSUJ LOSE LINE ────────
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, LOSE_LINE);
      ctx.lineTo(GAME_W, LOSE_LINE);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    return () => {
      clearInterval(checkLose);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onDrop);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onDrop);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center">
      {gameOver && score >= highscore && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} />}

      {/* HEADER */}
      <div className="w-full bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white text-center shadow-md z-10 relative overflow-hidden">
        <h2 className="text-2xl font-black italic tracking-wider flex items-center justify-center gap-2 relative z-10">
          <Cherry size={28} /> GRA W ARBUZA
        </h2>
      </div>

      {/* STATS */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
        <div className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Wynik: <span className="text-zinc-900 text-base">{score}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
          Następny:
          <div className="w-7 h-7 rounded-full shadow-inner border-2 border-white" style={{ backgroundColor: FRUITS[nextFruit].color }} />
        </div>
        <div className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Rekord: <span className="text-emerald-600">{highscore}</span>
        </div>
      </div>

      {/* CANVAS */}
      <div
        ref={sceneRef}
        className="w-full bg-orange-50 flex items-center justify-center touch-none"
        style={{ maxWidth: GAME_W }}
      />

      {/* GAME OVER */}
      {gameOver && (
        <div className="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-center gap-4 text-white">
          <Trophy size={64} className="text-yellow-400 drop-shadow-lg" />
          <h3 className="text-4xl font-black italic">KONIEC GRY!</h3>
          <p className="text-lg font-bold">Wynik: <span className="text-yellow-300">{score}</span></p>
          {score >= highscore && <p className="text-emerald-400 font-black uppercase tracking-widest text-sm animate-pulse">🎉 Nowy rekord!</p>}
          <button
            onClick={restartGame}
            className="mt-2 px-8 py-4 bg-white text-zinc-900 rounded-full font-black tracking-widest text-sm uppercase shadow-xl hover:scale-105 transition-transform"
          >
            ZAGRAJ PONOWNIE
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="w-full bg-zinc-100 p-3 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-zinc-200">
        Upuszczaj owoce, łącz identyczne! 🍉 Nie przekrocz linii!
      </div>
    </div>
  );
}
