'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation'; 
import Link from 'next/link';
import Image from 'next/image';

export default function HiddenUrwis() {
  // Poprawka: używamy session z Twojego SupabaseAuthContext
  const { user, session } = useSupabaseAuth(); 
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [foundToday, setFoundToday] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  // Lista stron, na których Urwis może się schować
  const ELIGIBLE_ROUTES = useMemo(() => [
    '/',
    '/oferta',
    '/nagrody',
    '/misje',
    '/gry',
    '/quiz',
    '/kontakt',
    '/promocje',
    '/profil'
  ], []);

  // Logika wybierania "Strony Dnia" na podstawie daty (ten sam wynik dla każdego)
  const targetRoute = useMemo(() => {
    const now = new Date();
    // Prosty seed bazujący na dacie: YYYYMMDD
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    return ELIGIBLE_ROUTES[seed % ELIGIBLE_ROUTES.length];
  }, [ELIGIBLE_ROUTES]);

  const getDailyPosition = useCallback(() => {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const hash = seed.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const top = 20 + (Math.abs(hash % 60)); // Zakres 20-80%
    const left = 15 + (Math.abs((hash * 31) % 70)); // Zakres 15-85%
    return { top: `${top}%`, left: `${left}%` };
  }, []);

  useEffect(() => {
    setMounted(true); // Zapobieganie błędom hydracji
    const todayKey = `urwis_hidden_${new Date().toDateString()}`;
    
    if (localStorage.getItem(todayKey)) {
      setFoundToday(true);
    }
    setPosition(getDailyPosition());
  }, [getDailyPosition]);

  const handleClick = () => {
    // FIX: Teraz poprawnie sprawdza sesję z Twojego AuthContextu
    if (!session || !user) {
      setShowLoginModal(true);
      return;
    }

    const todayKey = `urwis_hidden_${new Date().toDateString()}`;
    localStorage.setItem(todayKey, 'true');
    setShowSuccessModal(true);
    setFoundToday(true);
  };

  // Strażnicy renderowania (Hydration Guard)
  if (!mounted) return null;
  if (pathname !== targetRoute) return null; // Urwis pokazuje się tylko na wylosowanej stronie
  if (foundToday) return null;

  return (
    <>
      <motion.div
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.9, scale: 1, rotate: [0, 5, -5, 0] }}
        transition={{
          opacity: { duration: 1, delay: 1 },
          scale: { duration: 1, delay: 1 },
          rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.3, opacity: 1 }}
        whileTap={{ scale: 0.8 }}
        className="fixed w-16 h-16 cursor-pointer select-none z-40"
        style={{
          top: position.top,
          left: position.left,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Image
          src="/urwis-icon.svg"
          alt="Ukryty Urwis"
          width={64}
          height={64}
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </motion.div>

      {/* Modal Sukcesu */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-9990 backdrop-blur-sm"
          >
            <motion.div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-7xl mb-4">🎉</div>
              <h3 className="text-3xl font-black mb-4">Znalazłeś Urwisa!</h3>
              <p className="text-lg text-gray-700 mb-6">
                Brawo! Kryjówka na dziś odkryta. <br/>
                Odbierz nagrodę w sekcji misji!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/misje">
                  <button className="px-6 py-3 bg-zinc-900 text-white rounded-full font-bold">Odbierz 🎁</button>
                </Link>
                <button onClick={() => setShowSuccessModal(false)} className="px-6 py-3 bg-gray-200 rounded-full font-bold">Zamknij</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Logowania */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-9990 backdrop-blur-sm"
          >
            <motion.div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-7xl mb-4">🔒</div>
              <h3 className="text-2xl font-black mb-4">Urwis ucieka!</h3>
              <p className="text-gray-700 mb-6">Zaloguj się, aby zbierać nagrody za znalezienie Urwisa.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setShowLoginModal(false); window.location.href='/profil' }} className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold">Zaloguj się 👤</button>
                <button onClick={() => setShowLoginModal(false)} className="px-6 py-3 bg-gray-200 rounded-full font-bold">Anuluj</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}