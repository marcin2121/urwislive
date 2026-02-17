'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PuzzleSliderProps {
  onComplete: () => void;
}

export default function PuzzleSlider({ onComplete }: PuzzleSliderProps) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const gridSize = 3;
  const totalTiles = gridSize * gridSize;

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  const initGame = () => {
    const initialTiles = Array.from({ length: totalTiles }, (_, i) => i);
    const shuffled = shuffleTiles(initialTiles);
    setTiles(shuffled);
    setMoves(0);
    setTimer(0);
    setGameWon(false);
    setIsPlaying(false);
  };

  const shuffleTiles = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Sprawdź czy puzzle jest rozwiązywalny
    return isSolvable(shuffled) ? shuffled : shuffleTiles(array);
  };


  const isSolvable = (tiles: number[]) => {
    let inversions = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] > tiles[j] && tiles[i] !== 0 && tiles[j] !== 0) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const canMove = (index: number, emptyIndex: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying) setIsPlaying(true);

    const emptyIndex = tiles.indexOf(0);
    if (canMove(index, emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);

      // Sprawdź czy wygrana
      const isWin = newTiles.every((tile, idx) => tile === idx);
      if (isWin) {
        setGameWon(true);
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTileEmoji = (num: number) => {
    const emojis = ['', '🧸', '🎮', '🎲', '🚗', '🎨', '⚽', '🎪', '🎁'];
    return emojis[num];
  };

  return (
    <div className="space-y-6">
      {/* Game info */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-green-100 rounded-lg">
            <div className="text-xs text-gray-600">Czas</div>
            <div className="text-lg font-black text-green-600">{formatTime(timer)}</div>
          </div>
          <div className="px-4 py-2 bg-blue-100 rounded-lg">
            <div className="text-xs text-gray-600">Ruchy</div>
            <div className="text-lg font-black text-blue-600">{moves}</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={initGame}
          className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold"
        >
          🔄 Nowa gra
        </motion.button>
      </div>

      {/* Puzzle board */}
      <div className="mx-auto" style={{ width: 'fit-content' }}>
        <div
          className="grid gap-2 bg-gray-200 p-4 rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}
        >
          {tiles.map((tile, index) => (
            <motion.div
              key={index}
              layout
              whileHover={tile !== 0 ? { scale: 1.05 } : {}}
              whileTap={tile !== 0 ? { scale: 0.95 } : {}}
              onClick={() => handleTileClick(index)}
              className={`w-24 h-24 flex items-center justify-center text-5xl font-black rounded-xl cursor-pointer transition-all ${tile === 0
                ? 'bg-transparent'
                : 'bg-linear-to-br from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                }`}
            >
              {tile !== 0 && (
                <div className="flex flex-col items-center">
                  <span>{getTileEmoji(tile)}</span>
                  <span className="text-xs mt-1">{tile}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {!isPlaying && !gameWon && (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700">
            💡 Kliknij kafelki obok pustego pola, aby je przesunąć. Ułóż liczby i emoji od 1 do 8!
          </p>
        </div>
      )}

      {/* Win modal */}
      {gameWon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 bg-linear-to-r from-green-100 to-emerald-100 rounded-2xl"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-black mb-2">Gratulacje!</h3>
          <p className="text-gray-700 mb-4">
            Ukończyłeś puzzle w {moves} ruchach i czasie {formatTime(timer)}!
          </p>

          {/* Ocena wyniku */}
          <div className="mb-4">
            {moves < 30 && timer < 60 && (
              <div className="text-yellow-600 font-bold">⭐⭐⭐ Perfekcyjny wynik!</div>
            )}
            {(moves >= 30 && moves < 50) && (
              <div className="text-blue-600 font-bold">⭐⭐ Świetna robota!</div>
            )}
            {moves >= 50 && (
              <div className="text-green-600 font-bold">⭐ Dobra próba!</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 inline-block mb-4">
            <div className="text-sm text-gray-600 mb-1">Twój kupon:</div>
            <div className="text-2xl font-black text-green-600">PUZZLE15</div>
            <div className="text-sm text-gray-600">15% zniżki na puzzle i układanki</div>
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initGame}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold"
            >
              🔄 Graj ponownie
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold"
            >
              Użyj kuponu
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
