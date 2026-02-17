'use client'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

export default function AnimatedTextIntro({ onComplete }: { onComplete?: () => void }) {
  // --- LOGIKA 3D TILT ---
  const ref = useRef<HTMLDivElement>(null);
  
  // Wartości myszki (0-1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth spring physics (tłumienie drgań)
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // Transformacje obrotu (zakres -15 do 15 stopni)
  const rotateX = useTransform(mouseY, [0, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [0, 1], [-15, 15]);
  
  // Przesunięcie cienia i blasku
  const contentX = useTransform(mouseX, [0, 1], [-20, 20]);
  const contentY = useTransform(mouseY, [0, 1], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const mouseXVal = (e.clientX - rect.left) / width;
      const mouseYVal = (e.clientY - rect.top) / height;
      x.set(mouseXVal);
      y.set(mouseYVal);
    }
  };

  useEffect(() => {
    // Wielki wybuch konfetti na start
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#BF2024', '#0055ff', '#FFD700']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#BF2024', '#0055ff', '#FFD700']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.5, filter: 'blur(30px)' }}
      className="fixed inset-0 z-9998 bg-[#F8F9FC] flex items-center justify-center overflow-hidden cursor-pointer perspective-1000"
      onMouseMove={handleMouseMove}
      onClick={onComplete}
      ref={ref}
      style={{ perspective: 1000 }} // Kluczowe dla efektu 3D
    >
      {/* --- TŁO: Dynamiczny Gradient --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#BF2024]/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#0055ff]/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* --- PŁYWAJĄCE CZĄSTECZKI (PARALLAX) --- */}
      <motion.div style={{ x: contentX, y: contentY }} className="absolute inset-0 pointer-events-none">
         {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4, y: [0, -30, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.2 }}
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
              }}
            >
              {['✨', '🎈', '🚀', '⭐'][i % 4]}
            </motion.div>
         ))}
      </motion.div>

      {/* --- GŁÓWNA KARTA 3D --- */}
      <motion.div
        style={{ rotateX, rotateY, z: 100 }}
        className="relative z-50 flex flex-col items-center justify-center"
      >
        {/* POŚWIATA ZA OBIEKTEM */}
        <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
           transition={{ duration: 3, repeat: Infinity }}
           className="absolute inset-0 bg-linear-to-tr from-[#BF2024] to-[#0055ff] blur-[80px] rounded-full -z-10"
        />

        {/* OBRAZEK */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="relative w-[80vw] md:w-[500px] h-[40vh] md:h-[500px] flex items-center justify-center"
        >
          <Image
            src="/urwis-welcome.webp"
            alt="Witaj w Urwisie"
            fill
            className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            priority
          />
        </motion.div>

        {/* TYPOGRAFIA */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-center mt-6 relative"
        >
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] via-[#FFD700] to-[#0055ff] drop-shadow-sm mb-2">
            Witaj w klubie <br/> Urwisa
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs md:text-sm">
            Kliknij ekran, aby wejść
          </p>
        </motion.div>
      </motion.div>
      
      {/* MOUSE FOLLOWER (REFLEKTOR) */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {/* Prosta wizualizacja podążania za kursorem używając CSS transform na podstawie motion values */}
         {/* Uwaga: W Framer Motion lepiej użyć useSpring dla płynności */}
      </div>

    </motion.div>
  );
}