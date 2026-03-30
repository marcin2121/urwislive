'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  finishArcadeGame,
  submitBubbleShooterScore,
  getBubbleShooterRanking,
} from '@/app/actions/tamagotchi';
import { RankingItem } from '@/types/urwis';

// Konfiguracja geometrii i gry
export const COLORS = ['#bf2024', '#0055ff', '#22c54e', '#eab308', '#a855f7', '#f97316'];
export const BALL_RADIUS = 16;
export const DIAMETER = BALL_RADIUS * 2;
export const ROWS = 12;
export const COLS = 10;
export const CANVAS_WIDTH = COLS * DIAMETER;
export const CANVAS_HEIGHT = 600;
export const SHOOTER_Y = CANVAS_HEIGHT - 30;
export const SHOOTER_X = CANVAS_WIDTH / 2;
const SPEED = 12;
const COLORS_START = 3; // Ile kolorów na początku (poziom trudności rośnie)

interface Ball {
  x: number;
  y: number;
  color: string;
  gridR?: number;
  gridC?: number;
}

interface MovingBall extends Ball {
  dx: number;
  dy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
}

// Render 3D piłki
const drawGlossyBall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  colorHex: string,
) => {
  const gradient = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 8, x, y, r);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.2, colorHex);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const shadowGrad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x, y - r / 2, r / 1.5, r / 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();
};

export function useBubbleShooter(playerName: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stan reaktywny UI
  const [isStarted, setIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const levelRef = useRef(1);
  const [misses, setMisses] = useState(0);
  const missesRef = useRef(0);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [rankingStatusMessage, setRankingStatusMessage] = useState<string | null>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // Stan wewnętrzny gry
  const grid = useRef<(Ball | null)[][]>([]);
  const currentBall = useRef<Ball | null>(null);
  const nextBall = useRef<Ball | null>(null);
  const [nextColorUI, setNextColorUI] = useState('');

  const flyingBall = useRef<MovingBall | null>(null);
  const fallingBalls = useRef<MovingBall[]>([]);
  const particles = useRef<Particle[]>([]);

  const isAiming = useRef(false);
  const mousePos = useRef({ x: SHOOTER_X, y: SHOOTER_Y - 100 });
  const animationRef = useRef<number>(0);
  const availableColors = useRef<string[]>(COLORS.slice(0, COLORS_START));
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const playerNameRef = useRef(playerName);

  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  // Hex‑sąsiedzi
  const getNeighbors = useCallback((r: number, c: number) => {
    const isOffset = r % 2 !== 0;
    const neighbors: { r: number; c: number; ball: Ball }[] = [];

    const dirs = isOffset
      ? [
          [0, -1],
          [0, 1],
          [-1, 0],
          [-1, 1],
          [1, 0],
          [1, 1],
        ]
      : [
          [0, -1],
          [0, 1],
          [-1, -1],
          [-1, 0],
          [1, -1],
          [1, 0],
        ];

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 &&
        nr < grid.current.length &&
        nc >= 0 &&
        grid.current[nr] &&
        nc < grid.current[nr].length
      ) {
        const neighbor = grid.current[nr][nc];
        if (neighbor) neighbors.push({ r: nr, c: nc, ball: neighbor });
      }
    }
    return neighbors;
  }, []);

  // BFS klastra tego samego koloru
  const findCluster = useCallback((startR: number, startC: number, targetColor: string) => {
    const cluster = [{ r: startR, c: startC }];
    const visited = new Set([`${startR},${startC}`]);
    let i = 0;

    while (i < cluster.length) {
      const { r, c } = cluster[i];
      const neighbors = getNeighbors(r, c);

      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (!visited.has(key) && n.ball.color === targetColor) {
          visited.add(key);
          cluster.push({ r: n.r, c: n.c });
        }
      }
      i++;
    }
    return cluster;
  }, [getNeighbors]);

  // BFS kule przyczepione do sufitu
  const removeFloatingBalls = useCallback(() => {
    const attached = new Set<string>();
    const toCheck: { r: number; c: number }[] = [];

    if (grid.current[0]) {
      for (let c = 0; c < grid.current[0].length; c++) {
        if (grid.current[0][c]) {
          attached.add(`0,${c}`);
          toCheck.push({ r: 0, c });
        }
      }
    }

    let i = 0;
    while (i < toCheck.length) {
      const { r, c } = toCheck[i];
      const neighbors = getNeighbors(r, c);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (!attached.has(key)) {
          attached.add(key);
          toCheck.push({ r: n.r, c: n.c });
        }
      }
      i++;
    }

    let points = 0;
    let dropped = 0;
    for (let r = 0; r < grid.current.length; r++) {
      if (!grid.current[r]) continue;
      for (let c = 0; c < grid.current[r].length; c++) {
        if (grid.current[r][c] && !attached.has(`${r},${c}`)) {
          const fBall = grid.current[r][c]!;
          fallingBalls.current.push({
            ...fBall,
            dx: (Math.random() - 0.5) * 4,
            dy: Math.random() * 2 + 1,
          });
          grid.current[r][c] = null;
          points += 20;
          dropped++;
        }
      }
    }
    return { points, dropped };
  }, [getNeighbors]);

  const endGame = useCallback(async () => {
    if (gameOverRef.current) return;

    setGameOver(true);
    gameOverRef.current = true;
    setIsSubmittingScore(true);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (scoreRef.current > 500) {
      try {
        const reward = await finishArcadeGame('bubble_shooter');
        if (reward.success && reward.reward) {
          setRewardMsg(
            `Niesamowite! Zdobywasz +${reward.reward.coins} Monet i +${reward.reward.exp} EXP za tę grę!`,
          );
        }
      } catch (_e) {
        // opcjonalnie: log / komunikat
      }
    }

    const finalScore = scoreRef.current;
    const pName = playerNameRef.current.trim();
    try {
      if (pName !== '') {
        const saveRes = await submitBubbleShooterScore(
          pName,
          finalScore,
          levelRef.current,
        );
        if (saveRes?.success) {
          const rankData = await getBubbleShooterRanking(finalScore);
          if (rankData.success) {
            setRankingData(rankData.topScores || []);
            setRankingStatusMessage(rankData.statsMessage || null);
          }
        }
      } else {
        const rankData = await getBubbleShooterRanking(finalScore);
        if (rankData.success) {
          setRankingData(rankData.topScores || []);
          setRankingStatusMessage(rankData.statsMessage || null);
        }
      }
    } catch (_e) {
      // opcjonalnie: komunikat błędu rankingu
    }

    setIsSubmittingScore(false);
  }, []);

  const shiftBoardDown = useCallback(() => {
    grid.current.unshift([], []);

    for (let r = 0; r <= 1; r++) {
      const isOffset = r % 2 !== 0;
      const colsInRow = isOffset ? COLS - 1 : COLS;
      for (let c = 0; c < colsInRow; c++) {
        const color =
          availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
        if (!grid.current[r]) grid.current[r] = [];
        grid.current[r][c] = { x: 0, y: 0, color, gridR: r, gridC: c };
      }
    }

    for (let row = 0; row < grid.current.length; row++) {
      if (!grid.current[row]) continue;
      const off = row % 2 !== 0;
      for (let col = 0; col < grid.current[row].length; col++) {
        if (grid.current[row][col]) {
          const b = grid.current[row][col]!;
          b.gridR = row;
          b.gridC = col;
          b.x = off ? col * DIAMETER + DIAMETER : col * DIAMETER + BALL_RADIUS;
          b.y = row * (DIAMETER - 4) + BALL_RADIUS + 20;

          if (b.y >= SHOOTER_Y - DIAMETER) {
            endGame();
            return;
          }
        }
      }
    }
  }, [endGame]);

  const snapToGrid = useCallback((mBall: MovingBall, hitTargetR?: number, hitTargetC?: number) => {
    let r = Math.floor((mBall.y - 20) / (DIAMETER - 4));
    let isOffset = r % 2 !== 0;
    let c = isOffset
      ? Math.round((mBall.x - DIAMETER) / DIAMETER)
      : Math.round((mBall.x - BALL_RADIUS) / DIAMETER);

    if (r < 0) r = 0;
    if (c < 0) c = 0;
    const maxCols = isOffset ? COLS - 1 : COLS;
    if (c >= maxCols) c = maxCols - 1;

    const getIdealPos = (gr: number, gc: number) => {
      const gOff = gr % 2 !== 0;
      return {
        x: gOff ? gc * DIAMETER + DIAMETER : gc * DIAMETER + BALL_RADIUS,
        y: gr * (DIAMETER - 4) + BALL_RADIUS + 20,
      };
    };

    const isSlotEmpty = (sr: number, sc: number) => {
  if (sr < 0 || sc < 0) return false;
  const sOff = sr % 2 !== 0;
  const sMax = sOff ? COLS - 1 : COLS;
  if (sc >= sMax) return false;
  if (!grid.current[sr]) return true;
  return !grid.current[sr][sc];
};


    const isSlotSafe = (sr: number, sc: number) => {
      const ideal = getIdealPos(sr, sc);
      for (let rr = Math.max(0, sr - 1); rr <= Math.min(grid.current.length - 1, sr + 1); rr++) {
        if (!grid.current[rr]) continue;
        for (let cc = 0; cc < grid.current[rr].length; cc++) {
          if (grid.current[rr][cc]) {
            const dx = ideal.x - grid.current[rr][cc]!.x;
            const dy = ideal.y - grid.current[rr][cc]!.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < DIAMETER - 4) return false;
          }
        }
      }
      return true;
    };

    if ((grid.current[r] && grid.current[r][c]) || hitTargetR !== undefined) {
      const centerR = hitTargetR !== undefined ? hitTargetR : r;
      const centerC = hitTargetC !== undefined ? hitTargetC : c;

      const candidates: { nr: number; nc: number }[] = [];
      const candidateSet = new Set<string>();

      const cOffset = centerR % 2 !== 0;
      const dirs1 = cOffset
        ? [
            [0, -1],
            [0, 1],
            [-1, 0],
            [-1, 1],
            [1, 0],
            [1, 1],
          ]
        : [
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 0],
            [1, -1],
            [1, 0],
          ];

      for (const [dr, dc] of dirs1) {
        const nr = centerR + dr;
        const nc = centerC + dc;
        const key = `${nr},${nc}`;
        if (!candidateSet.has(key) && isSlotEmpty(nr, nc)) {
          candidateSet.add(key);
          candidates.push({ nr, nc });
        }
      }

      if (candidates.length === 0) {
        for (const [dr, dc] of dirs1) {
          const midR = centerR + dr;
          const midC = centerC + dc;
          const midOff = midR % 2 !== 0;
          const dirs2 = midOff
            ? [
                [0, -1],
                [0, 1],
                [-1, 0],
                [-1, 1],
                [1, 0],
                [1, 1],
              ]
            : [
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 0],
                [1, -1],
                [1, 0],
              ];
          for (const [dr2, dc2] of dirs2) {
            const nr = midR + dr2;
            const nc = midC + dc2;
            const key = `${nr},${nc}`;
            if (!candidateSet.has(key) && isSlotEmpty(nr, nc)) {
              candidateSet.add(key);
              candidates.push({ nr, nc });
            }
          }
        }
      }

      let bestScore = Infinity;
      let bestSpot: { nr: number; nc: number } | null = null;
      const ballDx = mBall.dx || 0;
      const ballDy = mBall.dy || -1;
      const ballSpeed = Math.sqrt(ballDx * ballDx + ballDy * ballDy) || 1;
      const normDx = ballDx / ballSpeed;
      const normDy = ballDy / ballSpeed;

      for (const cand of candidates) {
        const ideal = getIdealPos(cand.nr, cand.nc);
        const dx = mBall.x - ideal.x;
        const dy = mBall.y - ideal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const toCandDx = ideal.x - mBall.x;
        const toCandDy = ideal.y - mBall.y;
        const toCandLen = Math.sqrt(toCandDx * toCandDx + toCandDy * toCandDy) || 1;
        const dot =
          (toCandDx / toCandLen) * normDx +
          (toCandDy / toCandLen) * normDy;

        const directionBonus = (1 - dot) * BALL_RADIUS;
        const finalScore = dist + directionBonus;

        if (!isSlotSafe(cand.nr, cand.nc)) continue;

        if (finalScore < bestScore) {
          bestScore = finalScore;
          bestSpot = cand;
        }
      }

      if (bestSpot) {
        r = bestSpot.nr;
        c = bestSpot.nc;
      } else {
        r++;
        isOffset = r % 2 !== 0;
        const bMax = isOffset ? COLS - 1 : COLS;
        c = Math.max(0, Math.min(c, bMax - 1));

        while (grid.current[r] && grid.current[r][c]) {
          r++;
          isOffset = r % 2 !== 0;
          const nbMax = isOffset ? COLS - 1 : COLS;
          c = Math.max(0, Math.min(c, nbMax - 1));
        }
      }
    }

    if (!grid.current[r]) grid.current[r] = [];
    isOffset = r % 2 !== 0;

    const computedX = isOffset ? c * DIAMETER + DIAMETER : c * DIAMETER + BALL_RADIUS;
    const computedY = r * (DIAMETER - 4) + BALL_RADIUS + 20;

    grid.current[r][c] = {
      x: computedX,
      y: computedY,
      color: mBall.color,
      gridR: r,
      gridC: c,
    };
    flyingBall.current = null;

    if (computedY >= SHOOTER_Y - DIAMETER) {
      endGame();
      return;
    }

    const cluster = findCluster(r, c, mBall.color);

    if (cluster.length >= 3) {
      cluster.forEach(({ r, c }) => {
        const cr = grid.current[r][c]!;
        for (let p = 0; p < 8; p++) {
          particles.current.push({
            x: cr.x,
            y: cr.y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            radius: Math.random() * 6 + 2,
            color: cr.color,
            life: 1.0,
          });
        }
        grid.current[r][c] = null;
      });
      let earned = cluster.length * 10;
      const dr = removeFloatingBalls();
      earned += dr.points;

      setScore((s) => {
        const newScore = s + earned;
        scoreRef.current = newScore;
        const newLvl = Math.floor(newScore / 1000) + 1;
        if (newLvl > levelRef.current) {
          levelRef.current = newLvl;
          setLevel(newLvl);
          if (COLORS_START - 1 + newLvl <= COLORS.length) {
            availableColors.current = COLORS.slice(0, COLORS_START - 1 + newLvl);
          }
        }
        return newScore;
      });
    } else {
      missesRef.current += 1;
      setMisses(missesRef.current);
      if (missesRef.current >= 5) {
        shiftBoardDown();
        missesRef.current = 0;
        setMisses(0);
      }
    }

    const stored =
      nextBall.current?.color ??
      availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
    const generated =
      availableColors.current[Math.floor(Math.random() * availableColors.current.length)];

    currentBall.current = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      color: stored,
    };
    nextBall.current = {
      x: SHOOTER_X - 50,
      y: SHOOTER_Y + 10,
      color: generated,
    };
    setNextColorUI(generated);
  }, [endGame, findCluster, removeFloatingBalls, getNeighbors, shiftBoardDown]);



  const updatePhysics = useCallback(() => {
    if (!flyingBall.current) return;

    const SUBSTEPS = 2;
    for (let step = 0; step < SUBSTEPS; step++) {
      if (!flyingBall.current) return;
      const b = flyingBall.current;

      b.x += b.dx / SUBSTEPS;
      b.y += b.dy / SUBSTEPS;

      if (b.x - BALL_RADIUS <= 0 || b.x + BALL_RADIUS >= CANVAS_WIDTH) {
        b.dx *= -1;
        b.x = b.x - BALL_RADIUS <= 0 ? BALL_RADIUS : CANVAS_WIDTH - BALL_RADIUS;
      }
      if (b.y - BALL_RADIUS <= 20) {
        snapToGrid(b);
        return;
      }

      let hitT: { r: number; c: number } | null = null;
      let hitDist = 999;

      const approxRow = Math.floor((b.y - 20) / (DIAMETER - 4));
      const rowsToCheck = [
        approxRow - 2,
        approxRow - 1,
        approxRow,
        approxRow + 1,
        approxRow + 2,
      ];

      for (const r of rowsToCheck) {
        if (r < 0 || r >= grid.current.length || !grid.current[r]) continue;
        for (let c = 0; c < grid.current[r].length; c++) {
          const target = grid.current[r][c];
          if (!target) continue;

          const dx = b.x - target.x;
          const dy = b.y - target.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < DIAMETER - 2 && d < hitDist) {
            hitDist = d;
            hitT = { r, c };
          }
        }
      }

      if (hitT) {
        snapToGrid(b, hitT.r, hitT.c);
        return;
      }
    }
  }, [snapToGrid]);

  const drawTrajectory = useCallback((
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    angle: number,
  ) => {
    let px = startX;
    let py = startY;
    let dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const RayLengthMultiplier = 600;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);

    let pathLen = 0;
    let hitGrid = false;

    while (pathLen < RayLengthMultiplier && !hitGrid) {
      let nextX = px + dx * 10;
      const nextY = py + dy * 10;

      if (nextX - BALL_RADIUS <= 0) {
        nextX = BALL_RADIUS;
        dx *= -1;
        ctx.lineTo(nextX, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(nextX, py);
      } else if (nextX + BALL_RADIUS >= CANVAS_WIDTH) {
        nextX = CANVAS_WIDTH - BALL_RADIUS;
        dx *= -1;
        ctx.lineTo(nextX, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(nextX, py);
      }

      if (nextY - BALL_RADIUS <= 20) {
        hitGrid = true;
      } else {
        for (let r = 0; r < grid.current.length; r++) {
          if (!grid.current[r] || hitGrid) continue;
          for (let c = 0; c < grid.current[r].length; c++) {
            if (grid.current[r][c]) {
              const target = grid.current[r][c]!;
              const dtX = nextX - target.x;
              const dtY = nextY - target.y;
              if (Math.sqrt(dtX * dtX + dtY * dtY) < DIAMETER - 2) {
                hitGrid = true;
                break;
              }
            }
          }
        }
      }

      px = nextX;
      py = nextY;
      pathLen += 10;
    }
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(px, py, BALL_RADIUS - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const renderRef = useRef<() => void>(() => {});

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let r = 0; r < grid.current.length; r++) {
      if (!grid.current[r]) continue;
      for (let c = 0; c < grid.current[r].length; c++) {
        const b = grid.current[r][c];
        if (b) {
          drawGlossyBall(ctx, b.x, b.y, BALL_RADIUS - 1, b.color);
        }
      }
    }

    if (isAiming.current && currentBall.current && !flyingBall.current) {
      const dx = mousePos.current.x - SHOOTER_X;
      const dy = mousePos.current.y - SHOOTER_Y;
      const angle = Math.atan2(dy, dx);
      if (angle < 0) {
        drawTrajectory(ctx, SHOOTER_X, SHOOTER_Y, angle);
      }
    }

    fallingBalls.current.forEach((b) => {
      drawGlossyBall(ctx, b.x, b.y, BALL_RADIUS - 1, b.color);
    });

    particles.current.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    if (flyingBall.current) {
      drawGlossyBall(
        ctx,
        flyingBall.current.x,
        flyingBall.current.y,
        BALL_RADIUS - 1,
        flyingBall.current.color,
      );
    }

    if (nextBall.current && !flyingBall.current) {
      drawGlossyBall(
        ctx,
        nextBall.current.x,
        nextBall.current.y,
        BALL_RADIUS - 6,
        nextBall.current.color,
      );
    }

    ctx.beginPath();
    ctx.arc(SHOOTER_X, SHOOTER_Y + 10, 24, Math.PI, 0);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    if (currentBall.current && !flyingBall.current) {
      drawGlossyBall(
        ctx,
        currentBall.current.x,
        currentBall.current.y,
        BALL_RADIUS - 1,
        currentBall.current.color,
      );
    }

    if (isStarted && !gameOverRef.current) {
      updatePhysics();

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5;
        p.life -= 0.05;
        if (p.life <= 0) particles.current.splice(i, 1);
      }

      for (let i = fallingBalls.current.length - 1; i >= 0; i--) {
        const f = fallingBalls.current[i];
        f.x += f.dx;
        f.y += f.dy;
        f.dy += 0.4;
        if (f.y > CANVAS_HEIGHT + DIAMETER) {
          fallingBalls.current.splice(i, 1);
        }
      }
    }

    animationRef.current = requestAnimationFrame(renderRef.current);
  }, [isStarted, updatePhysics, drawTrajectory]);

  useLayoutEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    if (isStarted && !gameOver) {
      render();
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isStarted, gameOver, render]);

  const swapBalls = useCallback(() => {
    if (!isStarted || flyingBall.current || !currentBall.current || !nextBall.current) return;
    const tc = currentBall.current.color;
    currentBall.current.color = nextBall.current.color;
    nextBall.current.color = tc;
    setNextColorUI(nextBall.current.color);
  }, [isStarted]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ShiftLeft') {
        e.preventDefault();
        swapBalls();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [swapBalls]);

  const updateMousePos = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    let clientX: number;
    let clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    mousePos.current = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handleInteractionStart = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isStarted || flyingBall.current || gameOver) return;
    isAiming.current = true;
    updateMousePos(e);
  }, [isStarted, gameOver, updateMousePos]);

  const handleInteractionMove = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (isAiming.current) {
      updateMousePos(e);
    }
  }, [updateMousePos]);

  const handleInteractionEnd = useCallback((
    _e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isStarted || !isAiming.current || !currentBall.current || flyingBall.current || gameOver)
      return;
    isAiming.current = false;

    const dx = mousePos.current.x - SHOOTER_X;
    const dy = mousePos.current.y - SHOOTER_Y;
    const angle = Math.atan2(dy, dx);

    if (dy >= -20) return;

    const vx = Math.cos(angle) * SPEED;
    const vy = Math.sin(angle) * SPEED;

    flyingBall.current = {
      x: currentBall.current.x,
      y: currentBall.current.y,
      color: currentBall.current.color,
      dx: vx,
      dy: vy,
    };
  }, [isStarted, gameOver]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (nextBall.current && isStarted && !gameOver && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      const dist = Math.sqrt(
        Math.pow(clickX - nextBall.current.x, 2) +
          Math.pow(clickY - nextBall.current.y, 2),
      );
      if (dist < 40) {
        swapBalls();
        return;
      }
    }
    handleInteractionStart(e);
  }, [isStarted, gameOver, swapBalls, handleInteractionStart]);

  const handleCanvasTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (nextBall.current && isStarted && !gameOver && canvasRef.current && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const clickX = (e.touches[0].clientX - rect.left) * scaleX;
      const clickY = (e.touches[0].clientY - rect.top) * scaleY;
      const dist = Math.sqrt(
        Math.pow(clickX - nextBall.current.x, 2) +
          Math.pow(clickY - nextBall.current.y, 2),
      );
      if (dist < 50) {
        swapBalls();
        return;
      }
    }
    handleInteractionStart(e);
  }, [isStarted, gameOver, swapBalls, handleInteractionStart]);


  const initGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const initialGrid: (Ball | null)[][] = [];
    availableColors.current = COLORS.slice(0, COLORS_START);

    for (let r = 0; r < 5; r++) {
      initialGrid[r] = [];
      const isOffset = r % 2 !== 0;
      const colsInRow = isOffset ? COLS - 1 : COLS;

      for (let c = 0; c < colsInRow; c++) {
        const x = isOffset ? c * DIAMETER + DIAMETER : c * DIAMETER + BALL_RADIUS;
        const y = r * (DIAMETER - 4) + BALL_RADIUS + 20;
        const color =
          availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
        initialGrid[r][c] = { x, y, color, gridR: r, gridC: c };
      }
    }

    grid.current = initialGrid;

    currentBall.current = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      color:
        availableColors.current[Math.floor(Math.random() * availableColors.current.length)],
    };

    const upcomingC =
      availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
    nextBall.current = {
      x: SHOOTER_X - 50,
      y: SHOOTER_Y + 10,
      color: upcomingC,
    };
    setNextColorUI(upcomingC);

    flyingBall.current = null;
    fallingBalls.current = [];
    particles.current = [];
    isAiming.current = false;

    setScore(0);
    scoreRef.current = 0;
    setLevel(1);
    levelRef.current = 1;
    setMisses(0);
    missesRef.current = 0;
    setGameOver(false);
    gameOverRef.current = false;
    setIsStarted(true);
    setRewardMsg(null);
    setRankingData([]);
    setRankingStatusMessage(null);
  }, []);

  return {
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
    nextColorUI,
    initGame,
    swapBalls,
    handleCanvasMouseDown,
    handleCanvasMouseMove: handleInteractionMove,
    handleCanvasMouseUp: handleInteractionEnd,
    handleCanvasMouseLeave: handleInteractionEnd,
    handleCanvasTouchStart,
    handleCanvasTouchMove: handleInteractionMove,
    handleCanvasTouchEnd: handleInteractionEnd,
  };
}
