'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ← WAŻNE: To musi być "export default function"
export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const increment = duration / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, increment);

    return () => clearInterval(timer);
  }, [onComplete]);

  const messages = [
    "Przygotowuję Urwisa...",
    "Rozpakowuję zabawki...",
    "Napompowuję balony...",
    "Prawie gotowe!",
  ];

  const messageIndex = Math.min(Math.floor(progress / 25), messages.length - 1);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 z-[9999] flex items-center justify-center"
        >
          <div className="text-center space-y-8 max-w-md mx-auto px-6">

            {/* Urwis Icon with Glow */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-red-400/30 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl relative z-10"
              >
                🎪
              </motion.div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <div className="text-3xl font-black text-red-600">
                Wczytuję Urwisa
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  ...
                </motion.span>
              </div>

              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium text-gray-600"
              >
                {messages[messageIndex]}
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                {/* Main Bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ width: '50%' }}
                />
              </div>

              {/* Percentage */}
              <div className="text-right">
                <motion.span
                  className="text-2xl font-black text-red-600"
                  animate={progress === 100 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {progress}%
                </motion.span>
              </div>
            </div>

            {/* Fun Loading Icons */}
            <div className="flex justify-center gap-4">
              {['🎈', '🎁', '🎮', '🎨'].map((icon, i) => (
                <motion.div
                  key={i}
                  className="text-4xl"
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
