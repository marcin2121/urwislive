'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HiddenUrwis() {
  const { user, session } = useSupabaseAuth();
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [foundToday, setFoundToday] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  // ✅ Lista podstron, na których Urwis może się schować
  const ELIGIBLE_ROUTES = useMemo(() => [
    '/', '/oferta', '/nagrody', '/misje', '/gry', '/quiz', '/kontakt', '/promocje', '/profil'
  ], []);

  // ✅ Logika wybierania "Strony Dnia" na podstawie daty (ten sam wynik dla wszystkich użytkowników danego dnia)
  const targetRoute = useMemo(() => {
    const now = new Date();
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
    const top = 15 + (Math.abs(hash % 70));
    const left = 10 + (Math.abs((hash * 31) % 80));
    return { top: `${top}%`, left: `${left}%` };
  }, []);

  useEffect(() => {
    setMounted(true);
    const todayKey = `urwis_hidden_${new Date().toDateString()}`;
    if (localStorage.getItem(todayKey)) setFoundToday(true);
    setPosition(getDailyPosition());
  }, [getDailyPosition]);

  const handleClick = () => {
    // ✅ FIX: Używamy session zamiast nieistniejącego isAuthenticated
    if (!session || !user) {
      setShowLoginModal(true);
      return;
    }
    const todayKey = `urwis_hidden_${new Date().toDateString()}`;
    localStorage.setItem(todayKey, 'true');
    setShowSuccessModal(true);
    setFoundToday(true);
  };

  if (!mounted) return null;
  if (pathname !== targetRoute) return null; // 🛡️ Ukryj, jeśli to nie jest wylosowana strona dnia
  if (foundToday) return null;

  return (
    <>
      <motion.div
        onClick={handleClick} initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.9, scale: 1, rotate: [0, 5, -5, 0] }}
        className="fixed w-16 h-16 cursor-pointer select-none z-40"
        style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }}
      >
        <Image src="/urwis-icon.svg" alt="Ukryty Urwis" width={64} height={64} className="w-full h-full object-contain drop-shadow-lg" />
      </motion.div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10000 backdrop-blur-sm">
            <motion.div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-7xl mb-4">🎉</div>
              <h3 className="text-3xl font-black mb-4">Znalazłeś Urwisa!</h3>
              <p className="text-lg text-gray-700 mb-6">Gratulacje! Znalazłeś ukrytego Urwisa! 🦸‍♂️<br/><span className="text-sm text-gray-600 mt-2 block">Odbierz nagrodę w sekcji misji!</span></p>
              <div className="flex gap-3 justify-center">
                <Link href="/misje"><button className="px-6 py-3 bg-zinc-900 text-white rounded-full font-bold">Odbierz Nagrodę! 🎁</button></Link>
                <button onClick={() => setShowSuccessModal(false)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold">Zamknij</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10000 backdrop-blur-sm">
            <motion.div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
              <div className="text-7xl mb-4">🔒</div>
              <h3 className="text-3xl font-black mb-4">Zaloguj się</h3>
              <p className="text-lg text-gray-700 mb-6">Musisz być zalogowany, aby zbierać nagrody i uczestniczyć w wyzwaniach!</p>
              <div className="flex gap-3 justify-center">
                <Link href="/profil"><button className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold">Zaloguj się 👤</button></Link>
                <button onClick={() => setShowLoginModal(false)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold">Anuluj</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}