'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickerGameProps {
  onComplete: () => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  points: number;
}

export default function ClickerGame({ onComplete }: ClickerGameProps) {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const itemIdRef = useRef(0);

  const gameItems = [
    { emoji: '🎁', points: 10 },
    { emoji: '🎮', points: 15 },
    { emoji: '🧸', points: 12 },
    { emoji: '⭐', points: 25 },
    { emoji: '💎', points: 50 },
    { emoji: '💣', points: -20 }, // Bomba - odejmuje punkty
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      const spawnInterval = setInterval(() => {
        spawnItem();
      }, 800);

      return () => clearInterval(spawnInterval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const moveInterval = setInterval(() => {
        setItems(prevItems => {
          const updated = prevItems
            .map(item => ({ ...item, y: item.y + item.speed }))
            .filter(item => item.y < 600);
          return updated;
        });
      }, 50);

      return () => clearInterval(moveInterval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  const spawnItem = () => {
    if (!gameAreaRef.current) return;

    const width = gameAreaRef.current.offsetWidth;
    const randomItem = gameItems[Math.floor(Math.random() * gameItems.length)];

    const newItem: FallingItem = {
      id: itemIdRef.current++,
      x: Math.random() * (width - 60),
      y: -60,
      emoji: randomItem.emoji,
      speed: 3 + Math.random() * 3,
      points: randomItem.points,
    };

    setItems(prev => [...prev, newItem]);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setCombo(0);
  };

  const endGame = () => {
    setGameState('finished');
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const handleItemClick = (item: FallingItem) => {
    if (item.points > 0) {
      const bonusPoints = combo > 0 ? Math.floor(item.points * (1 + combo * 0.1)) : item.points;
      setScore(prev => prev + bonusPoints);
      setCombo(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev + item.points));
      setCombo(0);
    }

    setItems(prev => prev.filter(i => i.id !== item.id));

    // Reset combo po 2 sekundach bez kliknięcia
    setTimeout(() => {
      setCombo(prev => Math.max(0, prev - 1));
    }, 2000);
  };

  const getCouponCode = () => {
    if (score >= 400) return { code: 'CLICKER20', discount: '20% zniżki' };
    if (score >= 300) return { code: 'CLICKER15', discount: '15% zniżki' };
    if (score >= 200) return { code: 'CLICKER10', discount: '10% zniżki' };
    return { code: 'CLICKER5', discount: '5% zniżki' };
  };

  return (
    <div className="space-y-6">
      {/* Game info */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-orange-100 rounded-lg">
            <div className="text-xs text-gray-600">Wynik</div>
            <div className="text-2xl font-black text-orange-600">{score}</div>
          </div>
          <div className="px-4 py-2 bg-red-100 rounded-lg">
            <div className="text-xs text-gray-600">Czas</div>
            <div className="text-2xl font-black text-red-600">{timeLeft}s</div>
          </div>
          {combo > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2 bg-yellow-100 rounded-lg"
            >
              <div className="text-xs text-gray-600">Combo</div>
              <div className="text-2xl font-black text-yellow-600">x{combo}</div>
            </motion.div>
          )}
        </div>

        {highScore > 0 && (
          <div className="px-4 py-2 bg-purple-100 rounded-lg">
            <div className="text-xs text-gray-600">Rekord</div>
            <div className="text-xl font-black text-purple-600">{highScore}</div>
          </div>
        )}
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-[600px] bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl overflow-hidden border-4 border-gray-200"
      >
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-3xl font-black mb-4">Złap Spadające Prezenty!</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Klikaj spadające przedmioty, aby zdobyć punkty. Uważaj na bomby 💣!
                <br />Łap kolejne przedmioty bez przerwy, aby zbudować combo!
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {gameItems.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl">{item.emoji}</div>
                    <div className={`text-xs font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </div>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-linear-to-r from-red-500 to-orange-500 text-white rounded-full font-black text-xl shadow-xl"
              >
                🎮 Start!
              </motion.button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => handleItemClick(item)}
                className="absolute cursor-pointer select-none"
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  fontSize: '3rem',
                }}
              >
                {item.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {gameState === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="text-center p-8">
              <div className="text-6xl mb-4">
                {score >= 400 ? '🏆' : score >= 200 ? '🎉' : '👍'}
              </div>
              <h3 className="text-3xl font-black mb-2">
                {score >= 400 ? 'Niesamowite!' : score >= 200 ? 'Świetnie!' : 'Dobra próba!'}
              </h3>
              <p className="text-2xl text-gray-700 mb-4">
                Twój wynik: <span className="font-black text-orange-600">{score}</span> punktów
              </p>

              <div className="bg-linear-to-r from-orange-100 to-red-100 rounded-lg p-6 inline-block mb-6">
                <div className="text-sm text-gray-600 mb-2">Twój kupon rabatowy:</div>
                <div className="text-3xl font-black text-orange-600 mb-1">
                  {getCouponCode().code}
                </div>
                <div className="text-sm text-gray-700">{getCouponCode().discount}</div>
              </div>

              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold"
                >
                  🔄 Graj ponownie
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onComplete}
                  className="px-6 py-3 bg-linear-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold"
                >
                  Użyj kuponu
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      {gameState === 'playing' && (
        <div className="text-center text-sm text-gray-600">
          💡 Klikaj szybko przedmioty zanim spadną! Unikaj bomb 💣
        </div>
      )}
    </div>
  );
}
