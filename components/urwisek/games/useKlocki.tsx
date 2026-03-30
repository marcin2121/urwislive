'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  finishArcadeGame,
  submitKlockiScore,
  getKlockiRanking,
} from '@/app/actions/tamagotchi';
import { RankingItem } from '@/types/urwis';

export const GRID_SIZE = 9;
export const CELL_SIZE = 42;
export const BOARD_PADDING = 16;
export const BOARD_SIZE = GRID_SIZE * CELL_SIZE + BOARD_PADDING * 2;

export const CANVAS_WIDTH = BOARD_SIZE;
export const CANVAS_HEIGHT = BOARD_SIZE + 160; // miejsce na deck u dołu

const COLORS = [
  '#bf2024', // czerwony
  '#0055ff', // niebieski
  '#22c54e', // zielony
  '#eab308', // żółty
  '#ec4899', // fuksja
  '#38bdf8', // błękitny
];

type GridCell = string | null; // hex koloru lub null

type ShapeMatrix = number[][];
interface ShapeDef {
  id: string;
  matrix: ShapeMatrix;
  color: string;
}

interface DeckShape extends ShapeDef {
  // pozycja startowa w decku (do wygodnego rysowania)
  deckX: number;
  deckY: number;
  used: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number; // 0–1
}

interface DragState {
  shapeIndex: number | null; // indeks w decku
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
  snappingRow: number | null;
  snappingCol: number | null;
}

// ---------- SHAPES ----------

const BASE_SHAPES: ShapeMatrix[] = [
  // klocek 1x1
  [[1]],
  // klocek 1x2
  [[1, 1]],
  // klocek 1x3
  [[1, 1, 1]],
  // klocek 2x2
  [
    [1, 1],
    [1, 1],
  ],
  // L 2x2
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  // kwadrat 3x3
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  // mały T
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  // krzyżyk
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
];

export function useKlocki(playerName: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const isSubmittingScore = useRef(false);

  const grid = useRef<GridCell[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)),
  );

  const [deck, setDeck] = useState<DeckShape[]>([]);
  const dragState = useRef<DragState>({
    shapeIndex: null,
    offsetX: 0,
    offsetY: 0,
    x: 0,
    y: 0,
    snappingRow: null,
    snappingCol: null,
  });

  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const gameOverRef = useRef(false);

  const [streak, setStreak] = useState(0);
  const streakRef = useRef(0);
  const [rerollsLeft, setRerollsLeft] = useState(1);
  const [comboMessage, setComboMessage] = useState<string | null>(null);

  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  // opcjonalnie: ranking jak w bubble_shooter
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [rankingStatusMessage, setRankingStatusMessage] = useState<string | null>(null);

  const randomShape = useCallback((): ShapeMatrix =>
    BASE_SHAPES[Math.floor(Math.random() * BASE_SHAPES.length)], []);

  const randomColor = useCallback((): string =>
    COLORS[Math.floor(Math.random() * COLORS.length)], []);

  const generateDeck = useCallback((): DeckShape[] => {
    const gap = CANVAS_WIDTH / 4;
    const baseY = BOARD_SIZE + 40;

    return [0, 1, 2].map((i) => ({
      id: `shape-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      matrix: randomShape(),
      color: randomColor(),
      deckX: gap * (i + 1),
      deckY: baseY,
      used: false,
    }));
  }, [randomShape, randomColor]);

  // ---------- UTILS GRID ----------

  const canPlaceShapeAt = useCallback((shape: ShapeMatrix, row: number, col: number): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = row + r;
        const gc = col + c;
        if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
        if (grid.current[gr][gc] !== null) return false;
      }
    }
    return true;
  }, []);

  const placeShape = useCallback((shape: ShapeMatrix, color: string, row: number, col: number) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = row + r;
        const gc = col + c;
        if (gr >= 0 && gr < GRID_SIZE && gc >= 0 && gc < GRID_SIZE) {
          grid.current[gr][gc] = color;
        }
      }
    }
  }, []);

  const checkAndClearLines = useCallback(() => {
    const toClear = new Set<string>();

    const rowsToClear = new Set<number>();
    const colsToClear = new Set<number>();
    const squaresToClear = new Set<string>();

    // pełne wiersze
    for (let r = 0; r < GRID_SIZE; r++) {
      let full = true;
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid.current[r][c]) {
          full = false;
          break;
        }
      }
      if (full) {
        rowsToClear.add(r);
        for (let c = 0; c < GRID_SIZE; c++) {
          toClear.add(`${r},${c}`);
        }
      }
    }

    // pełne kolumny
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (!grid.current[r][c]) {
          full = false;
          break;
        }
      }
      if (full) {
        colsToClear.add(c);
        for (let r = 0; r < GRID_SIZE; r++) {
          toClear.add(`${r},${c}`);
        }
      }
    }

    // pełne kwadraty 3x3
    for (let br = 0; br < GRID_SIZE; br += 3) {
      for (let bc = 0; bc < GRID_SIZE; bc += 3) {
        let full = true;
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) {
            if (!grid.current[r][c]) {
              full = false;
              break;
            }
          }
          if (!full) break;
        }
        if (full) {
          squaresToClear.add(`${br},${bc}`);
          for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
              toClear.add(`${r},${c}`);
            }
          }
        }
      }
    }

    if (toClear.size === 0) {
      return {
        clearedCells: 0,
        rowsCleared: 0,
        colsCleared: 0,
        squaresCleared: 0,
        groupsCleared: 0,
      };
    }

    // cząsteczki + czyszczenie
    toClear.forEach((key) => {
      const [r, c] = key.split(',').map(Number);
      const col = grid.current[r][c];
      if (!col) return;
      const x = BOARD_PADDING + c * CELL_SIZE + CELL_SIZE / 2;
      const y = BOARD_PADDING + r * CELL_SIZE + CELL_SIZE / 2;

      if (particles.current.length > 150) {
        particles.current.splice(0, particles.current.length - 150);
      }

      for (let i = 0; i < 8; i++) {
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          size: Math.random() * 6 + 4,
          color: col,
          life: 1,
        });
      }

      grid.current[r][c] = null;
    });

    return {
      clearedCells: toClear.size,
      rowsCleared: rowsToClear.size,
      colsCleared: colsToClear.size,
      squaresCleared: squaresToClear.size,
      groupsCleared:
        rowsToClear.size + colsToClear.size + squaresToClear.size,
    };
  }, []);

  const hasAnyMove = useCallback((deckShapes: DeckShape[]): boolean =>
    deckShapes.some((s) => {
      if (s.used) return false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlaceShapeAt(s.matrix, r, c)) return true;
        }
      }
      return false;
    }), [canPlaceShapeAt]);

  const endGame = useCallback(async () => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    if (scoreRef.current > bestScoreRef.current) {
      bestScoreRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
      try {
        localStorage.setItem('urwis_klocki_best', String(scoreRef.current));
      } catch {}
    }

    // nagroda arcade
    if (scoreRef.current > 200) {
      try {
        const reward = await finishArcadeGame('klocki');
        if (reward.success && reward.reward) {
          setRewardMsg(
            `Brawo! Zdobywasz +${reward.reward.coins} Monet i +${reward.reward.exp} EXP za Klocki!`,
          );
        }
      } catch {
        // opcjonalnie: log
      }
    }

    // ranking analogicznie do bubble_shooter
    isSubmittingScore.current = true;
    try {
      if (playerName.trim()) {
        const saveRes = await submitKlockiScore(
          playerName.trim(),
          scoreRef.current,
        );
        if (saveRes?.success) {
          const rankData = await getKlockiRanking(scoreRef.current);
          if (rankData.success) {
            setRankingData(rankData.topScores || []);
            setRankingStatusMessage(rankData.statsMessage || null);
          }
        }
      }
    } catch (_e) {}
    isSubmittingScore.current = false;
  }, [playerName]);

  // ---------- RENDERING ----------

  const drawRoundedBlock = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
  ) => {
    const r = size * 0.24;
    const grd = ctx.createLinearGradient(x, y, x + size, y + size);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.18, color);
    grd.addColorStop(1, '#000000');

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + size - r, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + r);
    ctx.lineTo(x + size, y + size - r);
    ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
    ctx.lineTo(x + r, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = grd;
    ctx.fill();

    ctx.strokeStyle = 'rgba(15,23,42,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // highlight
    ctx.beginPath();
    ctx.moveTo(x + r, y + 4);
    ctx.lineTo(x + size - r, y + 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // tło
    ctx.fillStyle = '#0f111a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // deska
    ctx.save();
    ctx.translate(BOARD_PADDING, BOARD_PADDING);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // siatka
    for (let i = 0; i <= GRID_SIZE; i++) {
      const p = i * CELL_SIZE;
      const isThick = i % 3 === 0;
      
      ctx.strokeStyle = isThick ? 'rgba(255, 255, 255, 0.25)' : 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = isThick ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, p);
      ctx.stroke();
    }

    // istniejące klocki
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = grid.current[r][c];
        if (!col) continue;
        const x = c * CELL_SIZE + 4;
        const y = r * CELL_SIZE + 4;
        drawRoundedBlock(ctx, x, y, CELL_SIZE - 8, col);
      }
    }

    ctx.restore();

    // DECK
    const deckShapes = deck;
    deckShapes.forEach((shape, index) => {
      if (shape.used) return;
      // jeśli kształt jest aktualnie przeciągany – nie rysujemy go w decku
      if (dragState.current.shapeIndex === index) return;

      const cell = CELL_SIZE * 0.7;
      const m = shape.matrix;
      const rows = m.length;
      const cols = m[0].length;
      const totalW = cols * cell;
      const totalH = rows * cell;

      const originX = shape.deckX - totalW / 2;
      const originY = shape.deckY - totalH / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!m[r][c]) continue;
          const x = originX + c * cell;
          const y = originY + r * cell;
          drawRoundedBlock(ctx, x, y, cell - 4, shape.color);
        }
      }
    });

    // przeciągany klocek
    if (dragState.current.shapeIndex !== null) {
      const idx = dragState.current.shapeIndex;
      const shape = deckShapes[idx];
      if (shape && !shape.used) {
        const cell = CELL_SIZE * 0.82;
        const m = shape.matrix;
        const rows = m.length;
        const cols = m[0].length;
        const totalW = cols * cell;
        const totalH = rows * cell;

        const originX = dragState.current.x - totalW / 2;
        const originY = dragState.current.y - totalH / 2;

        ctx.globalAlpha = 0.6;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (!m[r][c]) continue;
            const x = originX + c * cell;
            const y = originY + r * cell;
            drawRoundedBlock(ctx, x, y, cell - 4, shape.color);
          }
        }
        ctx.globalAlpha = 1;
      }

      // podgląd miejsca w siatce
      if (
        dragState.current.snappingRow !== null &&
        dragState.current.snappingCol !== null &&
        shape
      ) {
        const sr = dragState.current.snappingRow;
        const sc = dragState.current.snappingCol;

        // --- POGLĄD CZYSZCZENIA ---
        const tempGrid = grid.current.map(row => [...row]);
        for (let r = 0; r < shape.matrix.length; r++) {
          for (let c = 0; c < shape.matrix[r].length; c++) {
            if (shape.matrix[r][c]) {
              const gr = sr + r;
              const gc = sc + c;
              if (gr >= 0 && gr < GRID_SIZE && gc >= 0 && gc < GRID_SIZE) {
                tempGrid[gr][gc] = shape.color;
              }
            }
          }
        }

        const rowsToClear = new Set<number>();
        const colsToClear = new Set<number>();
        const squaresToClear = new Set<string>();

        // Wiersze
        for (let r = 0; r < GRID_SIZE; r++) {
          if (tempGrid[r].every(cell => cell !== null)) rowsToClear.add(r);
        }
        // Kolumny
        for (let c = 0; c < GRID_SIZE; c++) {
          let full = true;
          for (let r = 0; r < GRID_SIZE; r++) {
            if (!tempGrid[r][c]) { full = false; break; }
          }
          if (full) colsToClear.add(c);
        }
        // Kwadraty 3x3
        for (let br = 0; br < GRID_SIZE; br += 3) {
          for (let bc = 0; bc < GRID_SIZE; bc += 3) {
            let full = true;
            for (let r = br; r < br + 3; r++) {
              for (let c = bc; c < bc + 3; c++) {
                if (!tempGrid[r][c]) { full = false; break; }
              }
            }
            if (full) squaresToClear.add(`${br},${bc}`);
          }
        }

        ctx.save();
        ctx.translate(BOARD_PADDING, BOARD_PADDING);

        // Podświetlenie czyszczonych sekcji (Zielony)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;

        rowsToClear.forEach(r => {
          ctx.fillRect(0, r * CELL_SIZE, GRID_SIZE * CELL_SIZE, CELL_SIZE);
          ctx.strokeRect(0, r * CELL_SIZE, GRID_SIZE * CELL_SIZE, CELL_SIZE);
        });
        colsToClear.forEach(c => {
          ctx.fillRect(c * CELL_SIZE, 0, CELL_SIZE, GRID_SIZE * CELL_SIZE);
          ctx.strokeRect(c * CELL_SIZE, 0, CELL_SIZE, GRID_SIZE * CELL_SIZE);
        });
        squaresToClear.forEach(key => {
          const [br, bc] = key.split(',').map(Number);
          ctx.fillRect(bc * CELL_SIZE, br * CELL_SIZE, 3 * CELL_SIZE, 3 * CELL_SIZE);
          ctx.strokeRect(bc * CELL_SIZE, br * CELL_SIZE, 3 * CELL_SIZE, 3 * CELL_SIZE);
        });

        // Sam zarys klocka
        for (let r = 0; r < shape.matrix.length; r++) {
          for (let c = 0; c < shape.matrix[r].length; c++) {
            if (!shape.matrix[r][c]) continue;
            const gr = sr + r;
            const gc = sc + c;
            if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) continue;
            const x = gc * CELL_SIZE + 4;
            const y = gr * CELL_SIZE + 4;
            ctx.strokeRect(x, y, CELL_SIZE - 8, CELL_SIZE - 8);
          }
        }

        ctx.restore();
      }
    }

    // cząsteczki
    if (gameOverRef.current) return;

    particles.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.life -= 0.04;

      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    particles.current = particles.current.filter((p) => p.life > 0);

    animationRef.current = requestAnimationFrame(render);
  }, [deck, drawRoundedBlock]);

  // ---------- GAME LOOP (particles) ----------

  // useEffect dla Tick usunięty – zintegrowany z render()

  useEffect(() => {
    if (isStarted && !gameOver) {
      render();
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isStarted, gameOver, render]);

  // ---------- INTERAKCJA POINTER ----------

  const getCanvasCoords = useCallback((
    e: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const findDeckShapeAt = useCallback((x: number, y: number): number | null => {
    // proste trafienie w bounding box obszaru decku
    for (let i = 0; i < deck.length; i++) {
      const s = deck[i];
      if (s.used) continue;
      const cell = CELL_SIZE * 0.7;
      const rows = s.matrix.length;
      const cols = s.matrix[0].length;
      const totalW = cols * cell;
      const totalH = rows * cell;
      const originX = s.deckX - totalW / 2;
      const originY = s.deckY - totalH / 2;

      if (
        x >= originX &&
        x <= originX + totalW &&
        y >= originY &&
        y <= originY + totalH
      ) {
        return i;
      }
    }
    return null;
  }, [deck]);

  const updateSnapForDrag = useCallback(() => {
    const ds = dragState.current;
    if (ds.shapeIndex === null) {
      ds.snappingRow = null;
      ds.snappingCol = null;
      return;
    }
    const shape = deck[ds.shapeIndex];
    if (!shape) return;

    // przeliczenie pozycji środka na potencjalną komórkę siatki
    const boardX = ds.x - BOARD_PADDING;
    const boardY = ds.y - BOARD_PADDING;
    const approxCol = Math.floor(boardX / CELL_SIZE);
    const approxRow = Math.floor(boardY / CELL_SIZE);

    let bestRow: number | null = null;
    let bestCol: number | null = null;
    let bestDist = Infinity;

    for (let r = approxRow - 2; r <= approxRow + 2; r++) {
      for (let c = approxCol - 2; c <= approxCol + 2; c++) {
        if (!canPlaceShapeAt(shape.matrix, r, c)) continue;
        const centerX = BOARD_PADDING + (c + shape.matrix[0].length / 2) * CELL_SIZE;
        const centerY = BOARD_PADDING + (r + shape.matrix.length / 2) * CELL_SIZE;
        const dx = centerX - ds.x;
        const dy = centerY - ds.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          bestRow = r;
          bestCol = c;
        }
      }
    }

    if (bestRow !== null && bestCol !== null) {
      ds.snappingRow = bestRow;
      ds.snappingCol = bestCol;
    } else {
      ds.snappingRow = null;
      ds.snappingCol = null;
    }
  }, [deck, canPlaceShapeAt]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isStarted || gameOverRef.current) return;
    const pos = getCanvasCoords(e);
    if (!pos) return;

    const idx = findDeckShapeAt(pos.x, pos.y);
    if (idx === null) return;

    dragState.current.shapeIndex = idx;
    dragState.current.x = pos.x;
    dragState.current.y = pos.y;
    dragState.current.offsetX = 0;
    dragState.current.offsetY = 0;
    updateSnapForDrag();
  }, [isStarted, getCanvasCoords, findDeckShapeAt, updateSnapForDrag]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragState.current.shapeIndex === null) return;
    const pos = getCanvasCoords(e);
    if (!pos) return;

    dragState.current.x = pos.x;
    dragState.current.y = pos.y;
    updateSnapForDrag();
  }, [getCanvasCoords, updateSnapForDrag]);

  const onPointerUp = useCallback(() => {
    const ds = dragState.current;
    if (ds.shapeIndex === null) return;
    const shape = deck[ds.shapeIndex];
    if (!shape) {
      ds.shapeIndex = null;
      return;
    }

    if (ds.snappingRow !== null && ds.snappingCol !== null) {
      placeShape(shape.matrix, shape.color, ds.snappingRow, ds.snappingCol);

      const {
        clearedCells,
        colsCleared,
        squaresCleared,
        groupsCleared,
      } = checkAndClearLines();

      const placedBlocks =
        shape.matrix.reduce(
          (sum, row) => sum + row.reduce((s, v) => s + (v ? 1 : 0), 0),
          0,
        ) ?? 0;

      const base = placedBlocks * 10 + clearedCells * 15;

      if (clearedCells > 0) {
        streakRef.current += 1;
      } else {
        streakRef.current = 0;
      }
      setStreak(streakRef.current);

      const streakMult = 1 + Math.min(streakRef.current, 5) * 0.15;

      // COMBO
      let comboBonus = 0;
      let msg: string | null = null;

      if (colsCleared >= 2) {
        comboBonus += 80;
        msg = 'PODWÓJNE KOLUMNY!';
      }
      if (squaresCleared >= 2) {
        comboBonus += 120;
        msg = 'PODWÓJNE KWADRATY!';
      }
      if (colsCleared >= 1 && squaresCleared >= 1 && colsCleared + squaresCleared >= 2) {
        comboBonus += 50;
        msg = 'KOLUMNA + KWADRAT!';
      }
      if (groupsCleared >= 3) {
        comboBonus += 50;
        msg = 'MEGA KOMBO!';
      }

      if (msg) {
        setComboMessage(msg);
        setTimeout(() => setComboMessage(null), 900);
      }

      const gained = Math.round(base * streakMult + comboBonus);

      setScore((s) => {
        const ns = s + gained;
        scoreRef.current = ns;
        return ns;
      });

      const newDeck = deck.map((d, i) =>
        i === ds.shapeIndex ? { ...d, used: true } : d,
      );
      setDeck(newDeck);

      if (newDeck.every((d) => d.used)) {
        const freshDeck = generateDeck();
        setDeck(freshDeck);
        if (!hasAnyMove(freshDeck)) {
          endGame();
        }
      } else if (!hasAnyMove(newDeck)) {
        endGame();
      }

      ds.shapeIndex = null;
      ds.snappingRow = null;
      ds.snappingCol = null;
    } else {
      const startX = ds.x;
      const startY = ds.y;
      let t = 0;
      const steps = 6;
      const amplitude = 8;

      const shake = () => {
        t++;
        const offset = Math.sin((t / steps) * Math.PI * 4) * amplitude;
        dragState.current.x = startX + offset;
        dragState.current.y = startY;

        if (t < steps) {
          requestAnimationFrame(shake);
        } else {
          dragState.current.x = startX;
          dragState.current.y = startY;
          dragState.current.shapeIndex = null;
          dragState.current.snappingRow = null;
          dragState.current.snappingCol = null;
        }
      };
      requestAnimationFrame(shake);
    }
  }, [deck, placeShape, checkAndClearLines, generateDeck, hasAnyMove, endGame]);

  // ---------- INIT / RESET ----------

  const initGame = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    grid.current = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(null),
    );
    setDeck(generateDeck());
    particles.current = [];
    dragState.current = {
      shapeIndex: null,
      offsetX: 0,
      offsetY: 0,
      x: 0,
      y: 0,
      snappingRow: null,
      snappingCol: null,
    };
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setRewardMsg(null);
    setRankingData([]);
    setRankingStatusMessage(null);
    gameOverRef.current = false;
    setStreak(0);
    setRerollsLeft(1);
    streakRef.current = 0;
    setComboMessage(null);

    setIsStarted(true);
  }, [generateDeck]);

  const rerollDeck = useCallback(() => {
    if (!isStarted || gameOverRef.current) return;
    if (rerollsLeft <= 0) return;

    const newDeck = generateDeck();
    setDeck(newDeck);
    setRerollsLeft((x) => x - 1);
  }, [isStarted, rerollsLeft, generateDeck]);

  // ---------- BEST SCORE z localStorage ----------

  useEffect(() => {
    try {
      const best = localStorage.getItem('urwis_klocki_best');
      if (best) {
        const val = parseInt(best, 10);
        if (!Number.isNaN(val)) {
          setBestScore(val);
          bestScoreRef.current = val;
        }
      }
    } catch {}
  }, []);

  return {
    canvasRef,
    isStarted,
    setIsStarted,
    gameOver,
    score,
    bestScore,
    deck,
    streak,
    rerollsLeft,
    comboMessage,
    rewardMsg,
    rankingData,
    rankingStatusMessage,
    isSubmittingScore: isSubmittingScore.current,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    initGame,
    rerollDeck,
  };
}
