'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from './AuthContext'; // ← DODAJ

interface LoyaltyContextType {
  points: number;
  level: string;
  badges: string[];
  addPoints: (amount: number, reason: string) => void;
  redeemPoints: (amount: number) => boolean;
  pointsHistory: PointsHistory[];
}

interface PointsHistory {
  id: number;
  amount: number;
  reason: string;
  date: Date;
  type: 'earned' | 'redeemed';
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth(); // ← DODAJ
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  // Załaduj dane z localStorage przy starcie
  useEffect(() => {
    const savedPoints = localStorage.getItem('urwis_points');
    const savedHistory = localStorage.getItem('urwis_history');
    const savedBadges = localStorage.getItem('urwis_badges');

    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedHistory) setPointsHistory(JSON.parse(savedHistory));
    if (savedBadges) setBadges(JSON.parse(savedBadges));
  }, []);

  // Zapisz dane do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('urwis_points', points.toString());
    localStorage.setItem('urwis_history', JSON.stringify(pointsHistory));
    localStorage.setItem('urwis_badges', JSON.stringify(badges));
  }, [points, pointsHistory, badges]);

  const addPoints = (amount: number, reason: string) => {
    setPoints(prev => prev + amount);

    const newEntry: PointsHistory = {
      id: Date.now(),
      amount,
      reason,
      date: new Date(),
      type: 'earned'
    };

    setPointsHistory(prev => [newEntry, ...prev]);
    checkForNewBadges(points + amount);

    // ✨ DODAJ tracking punktów dziennych
    if (user) {
      const today = new Date().toDateString();
      const dailyPointsKey = `urwis_points_earned_${user.id}_${today}`;
      const currentDailyPoints = parseInt(localStorage.getItem(dailyPointsKey) || '0');
      localStorage.setItem(dailyPointsKey, (currentDailyPoints + amount).toString());

      console.log('💰 Points earned today:', currentDailyPoints + amount);

      // Trigger mission check
      window.dispatchEvent(new CustomEvent('missionProgress', {
        detail: { type: 'weekly_points', value: currentDailyPoints + amount }
      }));
    }
  };

  const redeemPoints = (amount: number): boolean => {
    if (points < amount) return false;

    setPoints(prev => prev - amount);

    const newEntry: PointsHistory = {
      id: Date.now(),
      amount: -amount,
      reason: 'Wymiana punktów na nagrodę',
      date: new Date(),
      type: 'redeemed'
    };

    setPointsHistory(prev => [newEntry, ...prev]);
    return true;
  };

  const checkForNewBadges = (currentPoints: number) => {
    const newBadges = [...badges];

    if (currentPoints >= 100 && !badges.includes('first_100')) {
      newBadges.push('first_100');
    }
    if (currentPoints >= 500 && !badges.includes('collector')) {
      newBadges.push('collector');
    }
    if (currentPoints >= 1000 && !badges.includes('master')) {
      newBadges.push('master');
    }
    if (pointsHistory.length >= 10 && !badges.includes('regular')) {
      newBadges.push('regular');
    }

    if (newBadges.length > badges.length) {
      setBadges(newBadges);
    }
  };

  const getLevel = (): string => {
    if (points < 100) return 'Brązowy';
    if (points < 500) return 'Srebrny';
    if (points < 1000) return 'Złoty';
    if (points < 2000) return 'Platynowy';
    return 'Diamentowy';
  };

  return (
    <LoyaltyContext.Provider value={{
      points,
      level: getLevel(),
      badges,
      addPoints,
      redeemPoints,
      pointsHistory,
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useSupabaseLoyalty() {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useSupabaseLoyalty must be used within LoyaltyProvider');
  }
  return context;
}
