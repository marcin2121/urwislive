'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';

interface SpinTheWheelProps {
  onComplete: () => void;
}

export default function SpinTheWheel({ onComplete }: SpinTheWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const prizes = [
    { label: '5% OFF', color: '#BF2024', code: 'SPIN5' },
    { label: '10% OFF', color: '#0055ff', code: 'SPIN10' },
    { label: 'Darmowa dostawa', color: '#10b981', code: 'FREESHIP' },
    { label: '15% OFF', color: '#f59e0b', code: 'SPIN15' },
    { label: 'Prezent gratis', color: '#8b5cf6', code: 'GIFT' },
    { label: '20% OFF', color: '#ec4899', code: 'SPIN20' },
  ];

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prizeAngle = (360 / prizes.length) * randomIndex;
    const spins = 360 * 5; // 5 full rotations
    const finalRotation = rotation + spins + prizeAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(prizes[randomIndex].label);
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Wheel */}
      <div className="relative">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="w-80 h-80 rounded-full relative"
          style={{
            background: `conic-gradient(${prizes.map((p, i) =>
              `${p.color} ${(i / prizes.length) * 360}deg ${((i + 1) / prizes.length) * 360}deg`
            ).join(', ')})`
          }}
        >
          {prizes.map((prize, index) => (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 origin-left text-white font-bold"
              style={{
                transform: `rotate(${(360 / prizes.length) * index}deg) translateX(80px)`,
              }}
            >
              {prize.label}
            </div>
          ))}

          {/* Center button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center">
            <span className="text-3xl">🎡</span>
          </div>
        </motion.div>

        {/* Arrow pointer */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl">
          ▼
        </div>
      </div>

      {/* Spin button */}
      {!result && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-full font-black text-xl shadow-xl disabled:opacity-50"
        >
          {isSpinning ? '🎰 Kręci się...' : '🎡 Zakręć kołem!'}
        </motion.button>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 bg-linear-to-r from-blue-100 to-purple-100 rounded-2xl"
        >
          <div className="text-6xl mb-4">🎊</div>
          <h3 className="text-3xl font-black mb-2">Wygrałeś!</h3>
          <p className="text-xl text-gray-700 mb-4">{result}</p>
          <div className="bg-white rounded-lg p-4 inline-block mb-4">
            <div className="text-sm text-gray-600 mb-1">Twój kupon:</div>
            <div className="text-2xl font-black text-purple-600">
              {prizes.find(p => p.label === result)?.code}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold"
          >
            Użyj kuponu w sklepie
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
