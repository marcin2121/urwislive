'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Trophy, Play, RotateCcw, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Stałe ────────────────────────────────────────────────────────────────────
const CW = 340
const CH = 600
const BR = 8
const PH = 12
const PY = CH - 40
const PADDLE_BASE_W = 80
const BCOLS = 8
const BGAP = 4
const BHEIGHT = 22
const BTOP = 60
const BASE_SPEED = 5
const PU_SPEED = 2.5
const LASER_SPEED = 10
const PU_CHANCE = 0.18
const FPS = 60
const PADDLE_SPEED_KB = 7

const BW = (CW - (BCOLS + 1) * BGAP) / BCOLS

const BRICK_COLORS: Record<number, string> = {
  1: '#22c54e',
  2: '#eab308',
  3: '#f97316',
  4: '#bf2024',
  5: '#a855f7',
}

type PUType = 'wide' | 'multiball' | 'laser' | 'slow' | 'life'

const PU_COLORS: Record<PUType, string> = {
  wide: '#3b82f6', multiball: '#ffd700', laser: '#ff0066', slow: '#22d3ee', life: '#f43f5e',
}
const PU_LABELS: Record<PUType, string> = {
  wide: 'W', multiball: 'M', laser: 'L', slow: 'S', life: '♥',
}
const PU_NAMES: Record<PUType, string> = {
  wide: 'Szersza', multiball: 'Multi', laser: 'Laser', slow: 'Zwolnij', life: 'Życie',
}

// ─── Interfejsy ───────────────────────────────────────────────────────────────
interface Ball     { x: number; y: number; vx: number; vy: number; id: number }
interface Brick    { x: number; y: number; hp: number; maxHp: number }
interface PUp      { x: number; y: number; type: PUType; id: number }
interface LaserObj { x: number; y: number; id: number }
interface Ptcl     { x: number; y: number; vx: number; vy: number; r: number; color: string; life: number }

// ─── Pure draw functions ───────────────────────────────────────────────────────
const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const g = ctx.createRadialGradient(x - BR / 3, y - BR / 3, BR / 8, x, y, BR)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.25, '#c7d2fe')
  g.addColorStop(1, 'rgba(60,60,200,0.5)')
  ctx.beginPath(); ctx.arc(x, y, BR, 0, Math.PI * 2)
  ctx.fillStyle = g; ctx.fill()
  ctx.beginPath(); ctx.ellipse(x, y - BR * 0.45, BR * 0.38, BR * 0.22, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill()
}

const drawBrick = (ctx: CanvasRenderingContext2D, b: Brick) => {
  const color = BRICK_COLORS[b.maxHp] || '#888'
  ctx.globalAlpha = 0.45 + (b.hp / b.maxHp) * 0.55
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.roundRect(b.x + 2, b.y + 2, BW, BHEIGHT, 4); ctx.fill()
  const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + BHEIGHT)
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.beginPath(); ctx.roundRect(b.x, b.y, BW, BHEIGHT, 4)
  ctx.fillStyle = g; ctx.fill()
  ctx.beginPath(); ctx.roundRect(b.x + 3, b.y + 3, BW - 6, BHEIGHT * 0.38, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill()
  ctx.globalAlpha = 1
  if (b.hp > 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(b.hp), b.x + BW / 2, b.y + BHEIGHT / 2)
  }
}

const drawPaddle = (ctx: CanvasRenderingContext2D, x: number, w: number, laser: boolean) => {
  const g = ctx.createLinearGradient(x - w / 2, PY, x - w / 2, PY + PH)
  g.addColorStop(0, laser ? '#ff3385' : '#818cf8')
  g.addColorStop(1, laser ? '#cc0044' : '#4338ca')
  ctx.beginPath(); ctx.roundRect(x - w / 2, PY, w, PH, PH / 2)
  ctx.fillStyle = g; ctx.fill()
  ctx.beginPath(); ctx.roundRect(x - w / 2 + 6, PY + 2, w - 12, PH / 2 - 2, PH / 4)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill()
  if (laser) {
    for (const s of [-1, 1]) {
      const lx = x + s * (w / 2 - 7)
      ctx.beginPath(); ctx.arc(lx, PY + 3, 4, 0, Math.PI * 2); ctx.fillStyle = '#ff0066'; ctx.fill()
      ctx.beginPath(); ctx.arc(lx, PY + 3, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill()
    }
  }
}

const drawPowerUp = (ctx: CanvasRenderingContext2D, p: PUp) => {
  ctx.shadowBlur = 14; ctx.shadowColor = PU_COLORS[p.type]
  ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2)
  ctx.fillStyle = PU_COLORS[p.type]; ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(PU_LABELS[p.type], p.x, p.y)
}

const generateBricks = (level: number): Brick[] => {
  const rows = Math.min(3 + Math.floor((level - 1) / 2), 10)
  const maxHp = Math.min(level, 5)
  const bricks: Brick[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < BCOLS; c++) {
      const hp = Math.max(1, Math.round(((rows - r) / rows) * maxHp))
      bricks.push({
        x: BGAP + c * (BW + BGAP),
        y: BTOP + r * (BHEIGHT + BGAP),
        hp, maxHp: hp,
      })
    }
  }
  return bricks
}

// ─── Komponent ────────────────────────────────────────────────────────────────
export default function Arkanoid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isStarted, setIsStarted] = useState(false)
  const [gameOver,  setGameOver]  = useState(false)
  const [score,     setScore]     = useState(0)
  const [level,     setLevel]     = useState(1)
  const [lives,     setLives]     = useState(3)

  const balls     = useRef<Ball[]>([])
  const bricks    = useRef<Brick[]>([])
  const powerUps  = useRef<PUp[]>([])
  const lasers    = useRef<LaserObj[]>([])
  const particles = useRef<Ptcl[]>([])

  const paddleX = useRef(CW / 2)
  const paddleW = useRef(PADDLE_BASE_W)

  const ballIdRef  = useRef(0)
  const puIdRef    = useRef(0)
  const laserIdRef = useRef(0)

  const scoreRef    = useRef(0)
  const livesRef    = useRef(3)
  const levelRef    = useRef(1)
  const gameOverRef = useRef(false)

  const widePaddleTimer = useRef(0)
  const laserActive     = useRef(false)
  const laserTimer      = useRef(0)
  const slowTimer       = useRef(0)
  const speedMult       = useRef(1)

  const keysPressed  = useRef<Set<string>>(new Set())
  const animationRef = useRef(0)

  // ── spawnBall ──────────────────────────────────────────────────────────────
  const spawnBall = useCallback(() => {
    const speed = BASE_SPEED + (levelRef.current - 1) * 0.25
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6
    ballIdRef.current++
    balls.current = [{
      x: CW / 2, y: PY - BR - 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      id: ballIdRef.current,
    }]
  }, [])

  // ── applyPowerUp ───────────────────────────────────────────────────────────
  const applyPowerUp = useCallback((type: PUType) => {
    switch (type) {
      case 'wide':
        paddleW.current = PADDLE_BASE_W * 1.65
        widePaddleTimer.current = 10 * FPS
        break
      case 'multiball':
        ;[...balls.current].forEach(b => {
          const spd  = Math.sqrt(b.vx ** 2 + b.vy ** 2)
          const base = Math.atan2(b.vy, b.vx)
          for (const offset of [Math.PI / 5, -Math.PI / 5]) {
            ballIdRef.current++
            balls.current.push({
              x: b.x, y: b.y,
              vx: Math.cos(base + offset) * spd,
              vy: Math.sin(base + offset) * spd,
              id: ballIdRef.current,
            })
          }
        })
        break
      case 'laser':
        laserActive.current = true
        laserTimer.current  = 10 * FPS
        break
      case 'slow':
        speedMult.current = 0.6
        slowTimer.current = 8 * FPS
        break
      case 'life':
        livesRef.current = Math.min(livesRef.current + 1, 5)
        setLives(livesRef.current)
        break
    }
  }, [])

  // ── nextLevel ──────────────────────────────────────────────────────────────
  const nextLevel = useCallback(() => {
    levelRef.current++
    setLevel(levelRef.current)
    bricks.current   = generateBricks(levelRef.current)
    powerUps.current = []
    lasers.current   = []
    spawnBall()
  }, [spawnBall])

  // ── shootLaser ────────────────────────────────────────────────────────────
  const shootLaser = useCallback(() => {
    if (!laserActive.current || gameOverRef.current) return
    const w = paddleW.current
    for (const offset of [-w / 2 + 7, w / 2 - 7]) {
      laserIdRef.current++
      lasers.current.push({ x: paddleX.current + offset, y: PY - 2, id: laserIdRef.current })
    }
  }, [])

  // ── initGame ──────────────────────────────────────────────────────────────
  const initGame = useCallback(() => {
    cancelAnimationFrame(animationRef.current)
    scoreRef.current = 0; livesRef.current = 3; levelRef.current = 1
    gameOverRef.current = false
    paddleX.current = CW / 2; paddleW.current = PADDLE_BASE_W
    widePaddleTimer.current = 0; laserActive.current = false
    laserTimer.current = 0; slowTimer.current = 0; speedMult.current = 1
    powerUps.current = []; lasers.current = []; particles.current = []
    bricks.current = generateBricks(1)
    setScore(0); setLevel(1); setLives(3)
    setGameOver(false); setIsStarted(true)
    spawnBall()
  }, [spawnBall])

  // ── render / game loop ────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CW, CH)

    const bg = ctx.createLinearGradient(0, 0, 0, CH)
    bg.addColorStop(0, '#0d0f1c'); bg.addColorStop(1, '#1a1c29')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)

    // Subtelna siatka
    ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1
    for (let x = 0; x < CW; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke()
    }

    bricks.current.forEach(b => drawBrick(ctx, b))
    powerUps.current.forEach(p => drawPowerUp(ctx, p))

    lasers.current.forEach(l => {
      const lg = ctx.createLinearGradient(l.x, l.y, l.x, l.y + 14)
      lg.addColorStop(0, '#fff'); lg.addColorStop(1, '#ff0066')
      ctx.shadowBlur = 10; ctx.shadowColor = '#ff0066'
      ctx.fillStyle = lg; ctx.fillRect(l.x - 2, l.y, 4, 14)
      ctx.shadowBlur = 0
    })

    particles.current.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fill()
    })
    ctx.globalAlpha = 1

    balls.current.forEach(b => drawBall(ctx, b.x, b.y))
    drawPaddle(ctx, paddleX.current, paddleW.current, laserActive.current)

    // Linia ostrzegawcza
    ctx.strokeStyle = 'rgba(255,60,60,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([6, 6])
    ctx.beginPath(); ctx.moveTo(0, PY - 10); ctx.lineTo(CW, PY - 10); ctx.stroke()
    ctx.setLineDash([])

    // ── Update ──────────────────────────────────────────────────────────────
    if (!gameOverRef.current) {

      // Klawiatura
      if (keysPressed.current.has('ArrowLeft'))
        paddleX.current = Math.max(paddleW.current / 2, paddleX.current - PADDLE_SPEED_KB)
      if (keysPressed.current.has('ArrowRight'))
        paddleX.current = Math.min(CW - paddleW.current / 2, paddleX.current + PADDLE_SPEED_KB)

      // Timery power-upów
      if (widePaddleTimer.current > 0 && --widePaddleTimer.current === 0) paddleW.current = PADDLE_BASE_W
      if (laserTimer.current    > 0 && --laserTimer.current    === 0) laserActive.current = false
      if (slowTimer.current     > 0 && --slowTimer.current     === 0) speedMult.current = 1

      // Ruch piłek
      for (let i = balls.current.length - 1; i >= 0; i--) {
        const b = balls.current[i]
        b.x += b.vx * speedMult.current
        b.y += b.vy * speedMult.current

        // Ściany
        if (b.x - BR <= 0)  { b.vx =  Math.abs(b.vx); b.x = BR }
        if (b.x + BR >= CW) { b.vx = -Math.abs(b.vx); b.x = CW - BR }
        if (b.y - BR <= 0)  { b.vy =  Math.abs(b.vy); b.y = BR }

        // Paletka
        if (
          b.vy > 0 &&
          b.y + BR >= PY &&
          b.y + BR <= PY + PH + BR &&
          b.x >= paddleX.current - paddleW.current / 2 - BR / 2 &&
          b.x <= paddleX.current + paddleW.current / 2 + BR / 2
        ) {
          const hitPos = (b.x - paddleX.current) / (paddleW.current / 2)
          const speed  = Math.sqrt(b.vx ** 2 + b.vy ** 2)
          const angle  = hitPos * (Math.PI / 3)
          b.vx = Math.sin(angle) * speed
          b.vy = -Math.abs(Math.cos(angle) * speed)
          b.y  = PY - BR - 1
        }

        if (b.y - BR > CH) balls.current.splice(i, 1)
      }

      // Wszystkie piłki stracone
      if (balls.current.length === 0) {
        livesRef.current--
        setLives(livesRef.current)
        if (livesRef.current <= 0) {
          gameOverRef.current = true
          setGameOver(true)
        } else {
          spawnBall()
        }
      }

      // Piłka vs Klocki (AABB + detekcja osi odbicia)
      balls.current.forEach(ball => {
        let reflected = false
        for (let i = bricks.current.length - 1; i >= 0; i--) {
          const b  = bricks.current[i]
          const ox = Math.min(ball.x + BR, b.x + BW)     - Math.max(ball.x - BR, b.x)
          const oy = Math.min(ball.y + BR, b.y + BHEIGHT) - Math.max(ball.y - BR, b.y)
          if (ox <= 0 || oy <= 0) continue

          b.hp--
          const col = BRICK_COLORS[b.maxHp]
          for (let p = 0; p < 6; p++) {
            particles.current.push({
              x: b.x + BW / 2, y: b.y + BHEIGHT / 2,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              r: Math.random() * 3.5 + 1.5, color: col, life: 1,
            })
          }

          if (b.hp <= 0) {
            scoreRef.current += b.maxHp * 10 * levelRef.current
            setScore(scoreRef.current)
            if (Math.random() < PU_CHANCE) {
              const types: PUType[] = ['wide', 'multiball', 'laser', 'slow', 'life']
              puIdRef.current++
              powerUps.current.push({
                x: b.x + BW / 2, y: b.y,
                type: types[Math.floor(Math.random() * types.length)],
                id: puIdRef.current,
              })
            }
            bricks.current.splice(i, 1)
          }

          if (!reflected) {
            if (ox < oy) ball.vx *= -1
            else         ball.vy *= -1
            reflected = true
          }
        }
      })

      // Power-up ruch + zbieranie
      for (let i = powerUps.current.length - 1; i >= 0; i--) {
        const p = powerUps.current[i]
        p.y += PU_SPEED
        const collected =
          p.y >= PY - 12 && p.y <= PY + PH + 12 &&
          p.x >= paddleX.current - paddleW.current / 2 - 12 &&
          p.x <= paddleX.current + paddleW.current / 2 + 12
        if (collected) { applyPowerUp(p.type); powerUps.current.splice(i, 1) }
        else if (p.y > CH + 20) powerUps.current.splice(i, 1)
      }

      // Laser ruch + trafienie
      for (let i = lasers.current.length - 1; i >= 0; i--) {
        const l = lasers.current[i]
        l.y -= LASER_SPEED
        let hit = false
        for (let j = bricks.current.length - 1; j >= 0; j--) {
          const b = bricks.current[j]
          if (l.x >= b.x && l.x <= b.x + BW && l.y >= b.y && l.y <= b.y + BHEIGHT) {
            b.hp--
            if (b.hp <= 0) {
              scoreRef.current += b.maxHp * 10 * levelRef.current
              setScore(scoreRef.current)
              bricks.current.splice(j, 1)
            }
            hit = true; break
          }
        }
        if (hit || l.y < 0) lasers.current.splice(i, 1)
      }

      // Cząsteczki
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.04
        if (p.life <= 0) particles.current.splice(i, 1)
      }

      // Wszystkie klocki zbite
      if (bricks.current.length === 0) nextLevel()
    }

    animationRef.current = requestAnimationFrame(render)
  }, [isStarted, spawnBall, nextLevel, applyPowerUp])

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isStarted && !gameOver) render()
    return () => cancelAnimationFrame(animationRef.current)
  }, [isStarted, gameOver, render])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code)
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
      if (e.code === 'Space') shootLaser()
    }
    const onUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
    }
  }, [shootLaser])

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return
    const rect   = canvasRef.current.getBoundingClientRect()
    const scaleX = CW / rect.width
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    paddleX.current = Math.max(
      paddleW.current / 2,
      Math.min(CW - paddleW.current / 2, (clientX - rect.left) * scaleX)
    )
  }, [])

  const handleTap = useCallback(() => shootLaser(), [shootLaser])

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col items-center justify-center bg-black/80 w-full h-[100dvh] overflow-hidden touch-none select-none">

      {/* HUD */}
      {isStarted && !gameOver && (
        <div className="absolute top-0 w-full max-w-[380px] flex justify-between items-center px-4 py-3 z-10 pointer-events-none">
          <div className="flex bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ffd700]" />
            <span className="text-white font-bold tracking-wider">{score}</span>
          </div>
          <div className="flex gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart key={i} className={cn(
                'w-3.5 h-3.5 transition-all duration-300',
                i < lives ? 'text-red-500 fill-red-500 scale-110' : 'text-white/20'
              )} />
            ))}
          </div>
          <div className="flex bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
            <span className="text-white/80 text-sm font-medium">LVL <span className="text-white font-bold">{level}</span></span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        className="block max-w-full max-h-[100dvh] object-contain rounded-xl shadow-2xl border border-white/5 touch-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onClick={handleTap}
        onTouchEnd={handleTap}
      />

      {/* Legenda power-upów (w grze) */}
      {isStarted && !gameOver && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {(Object.entries(PU_LABELS) as [PUType, string][]).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 border border-white/10">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: PU_COLORS[type] }}
              >
                {label}
              </div>
              <span className="text-white/40 text-[9px]">{PU_NAMES[type]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ekran Startowy */}
      {!isStarted && (
        <Card className="absolute bg-[#1a1c29]/95 backdrop-blur-md border-indigo-500/30 p-8 flex flex-col items-center shadow-2xl z-20 rounded-2xl w-[90%] max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight text-center leading-tight">
            Urwis<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              Arkanoid
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mb-2 text-center max-w-[240px]">
            Odbijaj piłkę, rozbijaj klocki, łap power-upy!
          </p>
          <p className="text-zinc-600 text-xs mb-6 text-center">
            🖱️ mysz / dotyk — ruch paletki &nbsp;·&nbsp; klik / spacja — laser
          </p>

          {/* Power-up legenda */}
          <div className="grid grid-cols-5 gap-2 mb-6 w-full">
            {(Object.entries(PU_NAMES) as [PUType, string][]).map(([type, name]) => (
              <div key={type} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg"
                  style={{ backgroundColor: PU_COLORS[type], boxShadow: `0 0 12px ${PU_COLORS[type]}66` }}
                >
                  {PU_LABELS[type]}
                </div>
                <span className="text-[9px] text-zinc-500 text-center">{name}</span>
              </div>
            ))}
          </div>

          {/* HP legenda */}
          <div className="flex gap-2 mb-7">
            {Object.entries(BRICK_COLORS).map(([hp, color]) => (
              <div key={hp} className="flex flex-col items-center gap-1">
                <div className="w-7 h-4 rounded" style={{ backgroundColor: color }} />
                <span className="text-[9px] text-zinc-500">{hp} HP</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={initGame}
            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-lg rounded-xl shadow-lg"
          >
            START
          </Button>
        </Card>
      )}

      {/* Game Over */}
      {gameOver && (
        <Card className="absolute bg-[#1a1c29]/95 backdrop-blur-md border-indigo-500/30 p-8 flex flex-col items-center shadow-2xl z-20 rounded-2xl w-[90%] max-w-sm">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-sm border border-red-500/30">
            Game Over
          </div>
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-1">
            {score}
          </h2>
          <p className="text-zinc-400 font-medium mb-7">ZDOBYTE PUNKTY · LVL {level}</p>
          <Button
            onClick={initGame}
            className="w-full h-14 bg-white hover:bg-zinc-200 text-zinc-900 font-black text-lg rounded-xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Zagraj Ponownie
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 mt-3 border-white/10 text-white hover:bg-white/5 rounded-xl font-medium"
            onClick={() => (window.location.href = '/strefa-zabawy')}
          >
            Wyjdź do Menu
          </Button>
        </Card>
      )}
    </div>
  )
}
