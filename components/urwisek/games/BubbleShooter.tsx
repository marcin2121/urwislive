'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MoveLeft, RotateCcw, Trophy, CircleDot, Play, RefreshCw, AlertCircle } from 'lucide-react'
import { finishArcadeGame, submitBubbleShooterScore, getBubbleShooterRanking } from '@/app/actions/tamagotchi'
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Konfiguracja geometrii i gry
const COLORS = ['#bf2024', '#0055ff', '#22c54e', '#eab308', '#a855f7', '#f97316'];
const BALL_RADIUS = 16;
const DIAMETER = BALL_RADIUS * 2;
const ROWS = 12;
const COLS = 10;
const CANVAS_WIDTH = COLS * DIAMETER;
const CANVAS_HEIGHT = 600;
const SHOOTER_Y = CANVAS_HEIGHT - 30;
const SHOOTER_X = CANVAS_WIDTH / 2;
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

// Funkcja pomocnicza - "Cukierkowy" Render 3D Piłki
const drawGlossyBall = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colorHex: string) => {
  // Przejście gradientu z koloru bazowego na ciemniejszy - iluzja głębi
  const gradient = ctx.createRadialGradient(x - r/3, y - r/3, r/8, x, y, r);
  gradient.addColorStop(0, '#ffffff'); // Odbicie światła głównego hotspot
  gradient.addColorStop(0.2, colorHex);
  // Wyciemnienie krawędzi (zrobienie z hex np. 3D cienia wymaga parsowania - użyjemy globalAlpha overlay)
  
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Wewnętrzny ambient shadow dla bryły na bottom-right
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const shadowGrad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  // Dodatkowy błysk (Glossy refleks łuku na górze)
  ctx.beginPath();
  ctx.ellipse(x, y - r/2, r/1.5, r/3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();
};

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stan reaktywny UI
  const [isStarted, setIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const levelRef = useRef(1);
  const [misses, setMisses] = useState(0);
  const missesRef = useRef(0);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  
  // Elementy Rankingu i Tożsamości Gracza
  const [playerName, setPlayerName] = useState<string>('');
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [rankingStatusMessage, setRankingStatusMessage] = useState<string | null>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // Stan wewnętrzny (refy do pętli) obsługujący fizykę
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

  // Wczytywanie z localStorage na starcie
  useEffect(() => {
    const savedName = localStorage.getItem('urwis_bubble_nickname');
    if (savedName) {
       setPlayerName(savedName);
    }
  }, []);

  // Inicjalizacja siatki i startowej amunicji (generator)
  const initGame = useCallback(() => {
    if (animationRef.current) {
       cancelAnimationFrame(animationRef.current);
    }
    
    let initialGrid: (Ball | null)[][] = [];
    availableColors.current = COLORS.slice(0, COLORS_START);

    for (let r = 0; r < 5; r++) {
      initialGrid[r] = [];
      const isOffset = r % 2 !== 0;
      const colsInRow = isOffset ? COLS - 1 : COLS;

      for (let c = 0; c < colsInRow; c++) {
        const x = isOffset ? c * DIAMETER + DIAMETER : c * DIAMETER + BALL_RADIUS;
        const y = r * (DIAMETER - 4) + BALL_RADIUS + 20; // +20 top margin
        const color = availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
        initialGrid[r][c] = { x, y, color, gridR: r, gridC: c };
      }
    }

    grid.current = initialGrid;
    
    // Inicjacja magazynka
    currentBall.current = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      color: availableColors.current[Math.floor(Math.random() * availableColors.current.length)]
    };
    const upcomingC = availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
    nextBall.current = {
      x: SHOOTER_X - 50,
      y: SHOOTER_Y + 10,
      color: upcomingC
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

    // Save player name to localStorage
    if (playerName.trim().length >= 3) {
      localStorage.setItem('urwis_bubble_nickname', playerName.trim());
    }
  }, [playerName]);

  // Szukanie sasiadów (Hex Grid)
  const getNeighbors = (r: number, c: number) => {
    const isOffset = r % 2 !== 0;
    const neighbors = [];
    
    // Lista sąsiednich indeksów w układzie hex
    const dirs = isOffset 
      ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]] 
      : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < grid.current.length && nc >= 0 && grid.current[nr] && nc < grid.current[nr].length) {
         const neighbor = grid.current[nr][nc];
         if (neighbor) neighbors.push({ r: nr, c: nc, ball: neighbor });
      }
    }
    return neighbors;
  };

  // BFS algorytm - znajdz wszystkie dotykające się kule tego samego koloru
  const findCluster = (startR: number, startC: number, targetColor: string) => {
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
  };

  // BFS - znajdz wszystkie kule przymocowane do sufitu. Jeśli kula nie ma ścieżki do rzędu 0 to opada!
  const removeFloatingBalls = () => {
    const attached = new Set<string>();
    const toCheck = [];

    // Dodaj wszystkie kule z rzędu 0 do punktu startowego poszukiwań
    if (grid.current[0]) {
       for (let c = 0; c < grid.current[0].length; c++) {
         if (grid.current[0][c]) {
           attached.add(`0,${c}`);
           toCheck.push({ r: 0, c });
         }
       }
    }

    // Odwiedzaj każdego sasiada przypiętego do grupy root (sufitu)
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

    // Usuń te które są na gridzie ale nie ma ich w podzbiorze joined i dodaj do Gravity Fall
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
               dy: Math.random() * 2 + 1
             });
             grid.current[r][c] = null;
             points += 20; // 20 za opadnięcioną bańke
             dropped++;
          }
       }
    }
    return { points, dropped };
  };

  // Zatrzask i obsługa pękania 
  const snapToGrid = (mBall: MovingBall, hitTargetR?: number, hitTargetC?: number) => {
    // Oblicz docelowy slot
    let r = Math.floor((mBall.y - 20) / (DIAMETER - 4));
    let isOffset = r % 2 !== 0;
    let c = isOffset 
      ? Math.round((mBall.x - DIAMETER) / DIAMETER)
      : Math.round((mBall.x - BALL_RADIUS) / DIAMETER);

    if (r < 0) r = 0;
    if (c < 0) c = 0;
    const maxCols = isOffset ? COLS - 1 : COLS;
    if (c >= maxCols) c = maxCols - 1;

    // Próba inteligentnego Ślizgu (Slip)
    // Jeśli wyliczone miejsce jest zajęte lub wykreowaliśmy fizyczne zderzenie, szukaj wokoł docelowego pola
    if ((grid.current[r] && grid.current[r][c]) || hitTargetR !== undefined) {
       const centerR = hitTargetR !== undefined ? hitTargetR : r;
       const centerC = hitTargetC !== undefined ? hitTargetC : c;
       
       const cOffset = centerR % 2 !== 0;
       const dirs = cOffset 
          ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]] 
          : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
          
       let bestDist = Infinity;
       let bestSpot = null;

       for (const [dr, dc] of dirs) {
          const nr = centerR + dr;
          const nc = centerC + dc;
          const nOffset = nr % 2 !== 0;
          const nMaxCols = nOffset ? COLS - 1 : COLS;
          
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < nMaxCols) {
             // Zbadaj to pole
             if (!grid.current[nr] || !grid.current[nr][nc]) {
                const idealX = nOffset ? nc * DIAMETER + DIAMETER : nc * DIAMETER + BALL_RADIUS;
                const idealY = nr * (DIAMETER - 4) + BALL_RADIUS + 20;
                
                // Zwykły, matematyczny dystans od kuli bez sztucznych modyfikatorów
                const dist = Math.sqrt(Math.pow(mBall.x - idealX, 2) + Math.pow(mBall.y - idealY, 2));
                if (dist < bestDist) {
                   bestDist = dist;
                   bestSpot = { nr, nc };
                }
             }
          }
       }
       
       if (bestSpot) {
          r = bestSpot.nr;
          c = bestSpot.nc;
       } else {
          // Fallback w razie jakichś anomalii i "zamurowanej" bąbelka
          r++; 
          if (r >= ROWS) { endGame(); return; }
          isOffset = r % 2 !== 0;
          const bMax = isOffset ? COLS - 1 : COLS;
          c = Math.max(0, Math.min(c, bMax - 1));
          
          while (grid.current[r] && grid.current[r][c]) {
             r++;
             if (r >= ROWS) { endGame(); return; }
             isOffset = r % 2 !== 0;
             const nbMax = isOffset ? COLS - 1 : COLS;
             c = Math.max(0, Math.min(c, nbMax - 1));
          }
       }
    }

    // Bezpiecznie nadpisz do macierzy 
    if (!grid.current[r]) grid.current[r] = [];
    isOffset = r % 2 !== 0;
    
    // Twarde "Snapnięcie" fizycznego rysunku kuli do równych wymiarów z siatki (na stałe usuwa błąd overlapu wizualnego)
    const computedX = isOffset ? c * DIAMETER + DIAMETER : c * DIAMETER + BALL_RADIUS;
    const computedY = r * (DIAMETER - 4) + BALL_RADIUS + 20;

    grid.current[r][c] = { x: computedX, y: computedY, color: mBall.color, gridR: r, gridC: c };
    flyingBall.current = null;

    // Po zatrzaśnięciu sprawdź czy grupuje przynajmniej 3 bąble!
    const cluster = findCluster(r, c, mBall.color);
    
    if (cluster.length >= 3) {
      // Wybuch (Match) - usuń cluster
      cluster.forEach(({r, c}) => {
         const cr = grid.current[r][c]!;
         // Generuj Cząstki Wybuchu (Particles)
         for (let p = 0; p < 8; p++) {
           particles.current.push({
             x: cr.x,
             y: cr.y,
             vx: (Math.random() - 0.5) * 12,
             vy: (Math.random() - 0.5) * 12,
             radius: Math.random() * 6 + 2,
             color: cr.color,
             life: 1.0
           });
         }
         grid.current[r][c] = null;
      });
      let earned = cluster.length * 10;
      
      // Detekcja tych odciętych
      const dr = removeFloatingBalls();
      earned += dr.points;

      setScore(s => {
         const newScore = s + earned;
         scoreRef.current = newScore;
         // Co 1000 punktów dodaj trudniejszy kolor
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
      // Dolicz 'pudło' do licznika tury
      missesRef.current += 1;
      setMisses(missesRef.current);
      if (missesRef.current >= 5) {
         shiftBoardDown();
         missesRef.current = 0;
         setMisses(0);
      }
    }

    // Załaduj nową kulkę ze slotu magazynka (Swap slot)
    const stored = nextBall.current?.color || availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
    const generated = availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
    
    currentBall.current = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      color: stored
    };
    nextBall.current = {
      x: SHOOTER_X - 50,
      y: SHOOTER_Y + 10,
      color: generated
    };
    setNextColorUI(generated);
  };

  // Metoda wywoływana do wymiany
  const swapBalls = () => {
     if (!isStarted || flyingBall.current || !currentBall.current || !nextBall.current) return;
     const tc = currentBall.current.color;
     currentBall.current.color = nextBall.current.color;
     nextBall.current.color = tc;
     setNextColorUI(nextBall.current.color); // Trick: tu UI dla secondary podmieniać trza
  };

  // Kara (turowa) obniżająca cały sufit w dół jeśli nic się nie zbiło
  const shiftBoardDown = () => {
    // Wypchnij układ o 2 indexy w dół, zachowując integralność parzystości Hexów siatki na obu końcach
    grid.current.unshift([], []); 
    
    // Wygneruj nowe dwa rzędy sufitu na wierzchu z losowych kolorów
    for (let r = 0; r <= 1; r++) {
       const isOffset = r % 2 !== 0;
       const colsInRow = isOffset ? COLS - 1 : COLS;
       for (let c = 0; c < colsInRow; c++) {
         const color = availableColors.current[Math.floor(Math.random() * availableColors.current.length)];
         grid.current[r][c] = { x: 0, y: 0, color, gridR: r, gridC: c };
       }
    }

    // Zaktualizuj współrzędne wszystkich żeby zjechały w dół o jedną pozycję HEX 
    for (let row = 0; row < grid.current.length; row++) {
       if (!grid.current[row]) continue;
       const off = row % 2 !== 0;
       for (let col = 0; col < grid.current[row].length; col++) {
          if (grid.current[row][col]) {
             grid.current[row][col]!.gridR = row;
             grid.current[row][col]!.gridC = col;
             grid.current[row][col]!.x = off ? col * DIAMETER + DIAMETER : col * DIAMETER + BALL_RADIUS;
             grid.current[row][col]!.y = row * (DIAMETER - 4) + BALL_RADIUS + 20;
             
             // Ucieczka na dno - zgniecenie = Game Over
             if (grid.current[row][col]!.y >= SHOOTER_Y - DIAMETER) {
                 endGame();
                 return;
             }
          }
       }
    }
  };


  const endGame = async () => {
    if (gameOverRef.current) return;
    setGameOver(true);
    gameOverRef.current = true;
    setIsSubmittingScore(true);
    
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }
    
    // Przyznaj punkty ekonomii Urwiska jeśli score zadowalający
    if (scoreRef.current > 500) {
       const reward = await finishArcadeGame('bubble_shooter');
       if (reward.success && reward.reward) {
         setRewardMsg(`Niesamowite! Zarobiłeś/aś +${reward.reward.coins} Monet 🪙 i +${reward.reward.exp} EXP ⭐ za tą grę!`);
       }
    }
    
    // Zapisz WYNIK w tabeli SUPABASE
    const finalScore = scoreRef.current;
    if (playerName.trim() !== '') {
        const saveRes = await submitBubbleShooterScore(playerName.trim(), finalScore, levelRef.current);
        if (saveRes?.success) {
            // Po pomyślnym zapisie pobierz Ranking
            const rankData = await getBubbleShooterRanking(finalScore);
            if (rankData.success) {
               setRankingData(rankData.topScores || []);
               setRankingStatusMessage(rankData.statsMessage || null);
            }
        }
    } else {
        // Fallback jeżeli zagrał jako gość (nie powinno wystapic ze stałą w UI ale na wszelki wypadek)
        const rankData = await getBubbleShooterRanking(finalScore);
        if (rankData.success) {
           setRankingData(rankData.topScores || []);
           setRankingStatusMessage(rankData.statsMessage || null);
        }
    }
    
    setIsSubmittingScore(false);
  };


  // Obliczanie fizyki
  const updatePhysics = () => {
    if (!flyingBall.current) return;

    let b = flyingBall.current;
    b.x += b.dx;
    b.y += b.dy;

    // Kolizja ze ścianą 
    if (b.x - BALL_RADIUS <= 0 || b.x + BALL_RADIUS >= CANVAS_WIDTH) {
       b.dx *= -1; // Reflect! Odwrócenie wektora kierunku
       b.x = b.x - BALL_RADIUS <= 0 ? BALL_RADIUS : CANVAS_WIDTH - BALL_RADIUS;
    }
    // Kolizja z sufitem 
    if (b.y - BALL_RADIUS <= 20) {
       snapToGrid(b);
       return;
    }

    // Sprawdź szybką kolizję z inną dymionką zapisaną na gridzie
    let hitT = null;
    let hitDist = 999;
    
    const approxRow = Math.floor((b.y - 20) / (DIAMETER - 4));
    const rowsToCheck = [approxRow - 1, approxRow, approxRow + 1];

    for (const r of rowsToCheck) {
      if (r < 0 || r >= grid.current.length || !grid.current[r]) continue;
      for (let c = 0; c < grid.current[r].length; c++) {
         const target = grid.current[r][c];
         if (!target) continue;

         const dx = b.x - target.x;
         const dy = b.y - target.y;
         const d = Math.sqrt(dx * dx + dy * dy);

         // Zmniejszony hitbox - jeśli po odbiciu wsunie się za głęboko, algorytm snapToGrid (best dist) wyciągnie kulę na odpowiedni kafel
         if (d < DIAMETER - 4 && d < hitDist) { 
            hitDist = d;
            hitT = {r, c};
         }
      }
    }

    if (hitT) {
      snapToGrid(b, hitT.r, hitT.c);
    }
  };

  // Trajektoria Kolizji Poligonowej "Raycaster" (Odbicia od ściany bez pętli logiki strzału)
  const drawTrajectory = (ctx: CanvasRenderingContext2D, startX: number, startY: number, angle: number) => {
    let px = startX;
    let py = startY;
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);
    const RayLengthMultiplier = 600; // Zasięg podglądu rykoszetu na maxa
    
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    
    let pathLen = 0;
    let hitGrid = false;

    while (pathLen < RayLengthMultiplier && !hitGrid) {
      let nextX = px + dx * 10;
      let nextY = py + dy * 10;
      
      // Proste odbicie trajektorii od bocznej ściany
      if (nextX - BALL_RADIUS <= 0) {
         nextX = BALL_RADIUS;
         dx *= -1; // Rykoszet prawy
         ctx.lineTo(nextX, py);
         ctx.stroke();
         ctx.beginPath();
         ctx.moveTo(nextX, py);
      } else if (nextX + BALL_RADIUS >= CANVAS_WIDTH) {
         nextX = CANVAS_WIDTH - BALL_RADIUS;
         dx *= -1; // Rykoszet lewy
         ctx.lineTo(nextX, py);
         ctx.stroke();
         ctx.beginPath();
         ctx.moveTo(nextX, py);
      }
      
      // Detekcja wirtualnej kolizji z sufitem / bańką
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
                  // Tu też zmieniony promień żeby linia ładnie się wślizgiwała pokazując trickshota docelowego
                  if (Math.sqrt(dtX*dtX + dtY*dtY) < DIAMETER - 6) {
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
    
    // Narysuj celowniczek (kropke docelową)
    ctx.beginPath();
    ctx.arc(px, py, BALL_RADIUS - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };


  // Pętla renderowania - Czysty Canvas!
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Kule na siatce (Renderowanie 3D)
    for (let r = 0; r < grid.current.length; r++) {
      if (!grid.current[r]) continue;
      for (let c = 0; c < grid.current[r].length; c++) {
        const b = grid.current[r][c];
        if (b) {
           drawGlossyBall(ctx, b.x, b.y, BALL_RADIUS - 1, b.color);
        }
      }
    }

    // Linia strzału (Raycasting Celownikowy)
    if (isAiming.current && currentBall.current && !flyingBall.current) {
       const dx = mousePos.current.x - SHOOTER_X;
       const dy = mousePos.current.y - SHOOTER_Y;
       const angle = Math.atan2(dy, dx);
       
       // Nie pozwól celować w dół względem działka
       if (angle < 0) {
          drawTrajectory(ctx, SHOOTER_X, SHOOTER_Y, angle);
       }
    }

    // Lecące Oderwane Chmury Kulek Gravity
    fallingBalls.current.forEach((b) => {
       drawGlossyBall(ctx, b.x, b.y, BALL_RADIUS - 1, b.color);
    });

    // Cząsteczki Wybuchów
    particles.current.forEach((p) => {
       ctx.beginPath();
       ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
       ctx.fillStyle = p.color;
       ctx.globalAlpha = p.life;
       ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Lecąca kulka
    if (flyingBall.current) {
        drawGlossyBall(ctx, flyingBall.current.x, flyingBall.current.y, BALL_RADIUS - 1, flyingBall.current.color);
    }

    // Magazynek - Podgląd NEXT BALL (Mniejszy rozmiar i Glossy)
    if (nextBall.current && !flyingBall.current) {
        drawGlossyBall(ctx, nextBall.current.x, nextBall.current.y, BALL_RADIUS - 6, nextBall.current.color);
    }

    // Działko/Wskaźnik (opcjonalnie ozdoba)
    ctx.beginPath();
    ctx.arc(SHOOTER_X, SHOOTER_Y + 10, 24, Math.PI, 0);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Wyrzutnia i obecna startująca kulka (nakładana po działku)
    if (currentBall.current && !flyingBall.current) {
        drawGlossyBall(ctx, currentBall.current.x, currentBall.current.y, BALL_RADIUS - 1, currentBall.current.color);
    }
    
    // Obliczenia Physics Tick (wraz z Gravity Grawitacją w locie swobodnym)
    if (isStarted && !gameOverRef.current) {
      updatePhysics();
      
      // Update Particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
         const p = particles.current[i];
         p.x += p.vx;
         p.y += p.vy;
         p.vy += 0.5; // Gravity pull for particles
         p.life -= 0.05;
         if (p.life <= 0) particles.current.splice(i, 1);
      }

      // Update Falling Baloons
      for (let i = fallingBalls.current.length - 1; i >= 0; i--) {
        const f = fallingBalls.current[i];
        f.x += f.dx;
        f.y += f.dy;
        f.dy += 0.4; // Opad grawitacyjny klastrów 
        if (f.y > CANVAS_HEIGHT + DIAMETER) {
            fallingBalls.current.splice(i, 1);
        }
      }
    }

    animationRef.current = requestAnimationFrame(render);
  }, [isStarted]);

  // Uruchomienie pętli (Effect)
  useEffect(() => {
    if (isStarted && !gameOver) {
      render();
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isStarted, gameOver, render]);

  // Skrót klawiszowy
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ShiftLeft') {
        e.preventDefault();
        swapBalls();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isStarted, gameOver]);

  // Handler Akcji Myszy (Wskazywanie celownika / Oddanie Strzału)
  const handleInteractionStart = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isStarted || flyingBall.current || gameOver) return;
    isAiming.current = true;
    updateMousePos(e);
  };

  const handleInteractionMove = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (isAiming.current) {
      updateMousePos(e);
    }
  };

  const updateMousePos = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    let clientX, clientY;
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
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleInteractionEnd = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isStarted || !isAiming.current || !currentBall.current || flyingBall.current || gameOver) return;
    isAiming.current = false;
    
    // Wystrzel wektorem w myszkę!
    const dx = mousePos.current.x - SHOOTER_X;
    const dy = mousePos.current.y - SHOOTER_Y;
    const angle = Math.atan2(dy, dx);

    // Zablokuj strzał w dolne partie podłoża
    if (dy >= -20) return;

    const vx = Math.cos(angle) * SPEED;
    const vy = Math.sin(angle) * SPEED;

    flyingBall.current = {
      x: currentBall.current.x,
      y: currentBall.current.y,
      color: currentBall.current.color,
      dx: vx,
      dy: vy
    };
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center bg-black/80 font-sans w-full h-[100dvh] overflow-hidden overscroll-none touch-none scale-100 p-0 m-0" 
      ref={containerRef}
      onContextMenu={(e) => {
         e.preventDefault();
         swapBalls();
      }}
    >
      {/* HUD Wewnątrz Ekranu */}
      <div className="absolute top-0 w-full max-w-[500px] flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none">
         <div className="flex bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ffd700]" />
            <span className="text-white font-bold tracking-wider">{score}</span>
         </div>
         <div className="flex bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
            <span className="text-white/80 font-medium text-sm">LVL <span className="text-white font-bold">{level}</span></span>
         </div>
      </div>

      {/* Warstwa Canvas - Pełnoekranowy responsywny Box */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block bg-[#1a1c29] shadow-2xl rounded-xl max-w-full max-h-[100dvh] object-contain border border-white/5 active:cursor-crosshair touch-none"
        onMouseDown={handleInteractionStart}
        onMouseMove={handleInteractionMove}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchMove={handleInteractionMove}
        onTouchEnd={handleInteractionEnd}
      />
      
      {/* Przycisk SWAP Kulek */}
      {isStarted && !gameOver && (
          <div className="absolute bottom-[2%] right-[5%] z-20">
             <Button
                variant="outline"
                size="icon"
                onClick={swapBalls}
                className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 transition-all text-white shadow-lg"
             >
                <RefreshCw className="w-5 h-5" />
             </Button>
          </div>
      )}

      {/* Pasek postępu pudeł (Misses Counter) */}
      {isStarted && !gameOver && (
          <div className="absolute bottom-[2%] left-[5%] z-20 flex gap-1.5 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i < misses ? "bg-red-500 scale-125 shadow-[0_0_10px_rgba(239,68,68,0.7)]" : "bg-white/20"
              )} />
            ))}
          </div>
      )}

      {/* Ekran Startowy przed grą */}
      {!isStarted && (
        <Card className="absolute bg-[#1a1c29]/95 backdrop-blur-md border-indigo-500/30 p-8 flex flex-col items-center justify-center shadow-2xl z-20 rounded-2xl w-[90%] max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
             <Play className="w-10 h-10 text-white ml-2" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight text-center leading-tight">Lecę W<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Kulki</span></h2>
          <p className="text-zinc-300 text-sm mb-6 max-w-[250px] text-center font-medium">Połącz 3 takie same. Odbijaj od ścian. Nie dopuść do uderzenia w dno!</p>
          
          <div className="w-full mb-6 relative z-50 pointer-events-auto">
             <label className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-2 block ml-1">Twój Pseudonim</label>
             <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Wpisz nick na Ranking..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                maxLength={15}
             />
             {playerName.trim().length > 0 && playerName.trim().length < 3 && (
                <p className="text-xs text-red-400 mt-2 ml-1">* Nick musi mieć min. 3 znaki.</p>
             )}
          </div>

          <Button 
             size="lg" 
             onClick={initGame}
             disabled={playerName.trim().length < 3}
             className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all outline-none"
          >
            START
          </Button>
        </Card>
      )}

      {/* Ekran Game Over z Tablicą Wyników */}
      {gameOver && (
        <Card className="absolute top-0 left-0 w-full h-[100dvh] bg-[#1a1c29]/95 backdrop-blur-md border-0 p-6 flex flex-col shadow-none z-30 rounded-none touch-none overscroll-none overflow-hidden">
           <div className="flex-1 overflow-y-auto hide-scrollbar w-full max-w-md mx-auto py-10 flex flex-col items-center">
              <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-sm border border-red-500/30">
                 <AlertCircle className="w-4 h-4" /> Game Over
              </div>
              
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-1">{score}</h2>
              <p className="text-zinc-400 font-medium mb-6">ZDOBYTE PUNKTY (Lvl {level})</p>
              
              {rewardMsg && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 text-center text-sm font-medium w-full animate-in slide-in-from-bottom-2">
                   🎉 {rewardMsg}
                </div>
              )}

              {/* Sekcja Rankingu */}
              <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-4 mb-6 relative overflow-hidden flex-shrink-0">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                 <h3 className="font-bold text-white mb-3 text-lg flex items-center justify-between">
                    Top 10 Wyników 
                    <Trophy className="w-4 h-4 text-[#ffd700]" />
                 </h3>
                 
                 {isSubmittingScore ? (
                    <div className="flex items-center justify-center h-48">
                       <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                 ) : (
                    <div className="space-y-2">
                       {rankingStatusMessage && (
                          <div className={cn(
                             "text-center text-sm font-bold py-2 px-3 rounded-lg mb-4 border",
                             rankingStatusMessage.includes('Brawo') 
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                          )}>
                             {rankingStatusMessage}
                          </div>
                       )}
                       
                       {rankingData.length > 0 ? (
                          <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                             {rankingData.map((row, idx) => (
                                <div key={row.id} className={cn(
                                   "flex items-center justify-between p-2 rounded-lg text-sm mb-1 transition-all",
                                   idx === 0 ? "bg-amber-500/20 border border-amber-500/30 font-bold text-amber-400" :
                                   idx === 1 ? "bg-zinc-300/20 border border-zinc-300/30 font-bold text-zinc-300" :
                                   idx === 2 ? "bg-orange-700/20 border border-orange-700/30 font-bold text-orange-400" :
                                   row.player_name === playerName && row.score === score
                                      ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold" 
                                      : "bg-white/5 text-white shadow-sm font-medium"
                                )}>
                                   <div className="flex items-center gap-3">
                                      <span className="w-5 text-center opacity-50 font-mono text-xs">{idx + 1}.</span>
                                      <span className="truncate max-w-[120px]">{row.player_name}</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs opacity-50">lvl {row.level}</span>
                                      <span className="tabular-nums">{row.score}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="text-center py-6 text-white/40 text-sm">Nic tu nie ma... Bądź pierwszy!</div>
                       )}
                    </div>
                 )}
              </div>

              <div className="w-full grid gap-3 pb-8 mt-auto flex-shrink-0">
                 <Button 
                    onClick={initGame} 
                    disabled={isSubmittingScore}
                    className="w-full h-14 bg-white hover:bg-zinc-200 text-zinc-900 font-black text-lg rounded-xl"
                 >
                    <RotateCcw className="w-5 h-5 mr-2" /> Zagraj Ponownie
                 </Button>
                 <Button 
                    variant="outline"
                    className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl font-medium"
                    onClick={() => window.location.href = '/strefa-zabawy'}
                 >
                    Wyjdź do Menu
                 </Button>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
}
