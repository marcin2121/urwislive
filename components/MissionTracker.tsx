'use client'
import { useEffect, useRef, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePathname } from 'next/navigation';
import { updateStreak } from '@/utils/streakTracker';

export default function MissionTracker() {
  const { profile } = useSupabaseAuth();
  const { checkMissionProgress } = useNotifications();
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const checkedToday = useRef<Set<string>>(new Set());
  const sessionStartTime = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    sessionStartTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (!mounted || !profile) return;

    console.log('📊 MissionTracker Active:', { user: profile.username, path: pathname });

    const today = new Date().toDateString();
    const trackingKey = `urwis_tracking_${profile.id}_${today}`;
    
    // Bezpieczny dostęp do localStorage
    const getStoredData = () => JSON.parse(localStorage.getItem(trackingKey) || '{}');
    const setStoredData = (data: any) => localStorage.setItem(trackingKey, JSON.stringify(data));

    // 1. Śledzenie odwiedzin stron
    let trackingData = getStoredData();
    const visitedPages = trackingData.visited_pages || [];
    
    if (!visitedPages.includes(pathname)) {
      visitedPages.push(pathname);
      trackingData.visited_pages = visitedPages;
      trackingData.pages_visited = visitedPages.length;
      setStoredData(trackingData);
      
      const checkKey = `pages_visited_${visitedPages.length}`;
      if (!checkedToday.current.has(checkKey)) {
        checkedToday.current.add(checkKey);
        checkMissionProgress('pages_visited', visitedPages.length);
      }
    }

    // 2. Śledzenie konkretnych sekcji
    const trackSection = (key: string, pathPrefix: string) => {
      if (pathname.startsWith(pathPrefix) && !trackingData[key]) {
        trackingData[key] = 1;
        setStoredData(trackingData);
        if (!checkedToday.current.has(key)) {
          checkedToday.current.add(key);
          checkMissionProgress(key, 1);
        }
      }
    };

    trackSection('visit_home', '/');
    trackSection('visit_profile', '/profil');
    trackSection('visit_games', '/gry');

    // 3. Śledzenie czasu (Interwał)
    const interval = setInterval(() => {
      const freshData = getStoredData();
      const sessionElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      const previousTotal = freshData.time_spent_base || 0;
      const newTotal = previousTotal + sessionElapsed;
      
      freshData.time_spent = newTotal;
      setStoredData(freshData);

      // Milestone co minutę
      if (newTotal >= 60 && !checkedToday.current.has(`time_60`)) {
        checkedToday.current.add(`time_60`);
        checkMissionProgress('time_spent', newTotal);
      }
    }, 10000); // Sprawdzaj co 10s

    // 4. Zapis przy wyjściu
    const saveTimeOnExit = () => {
      const freshData = getStoredData();
      const sessionElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      const total = (freshData.time_spent_base || 0) + sessionElapsed;
      freshData.time_spent = total;
      freshData.time_spent_base = total;
      setStoredData(freshData);
    };

    window.addEventListener('beforeunload', saveTimeOnExit);
    window.addEventListener('pagehide', saveTimeOnExit);
    
    updateStreak(profile.id);

    return () => {
      clearInterval(interval);
      saveTimeOnExit();
      window.removeEventListener('beforeunload', saveTimeOnExit);
      window.removeEventListener('pagehide', saveTimeOnExit);
    };
  }, [profile, pathname, mounted, checkMissionProgress]);

  return null;
}