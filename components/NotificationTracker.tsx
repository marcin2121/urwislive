'use client'
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePathname } from 'next/navigation';

export default function MissionTracker() {
  const { user } = useSupabaseAuth();
  const { checkMissionProgress } = useNotifications();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    const today = new Date().toDateString();
    const trackingKey = `urwis_tracking_${user.id}_${today}`;
    const trackingData = JSON.parse(localStorage.getItem(trackingKey) || '{}');

    // Track page visit
    const visitedPages = trackingData.visited_pages || [];
    if (!visitedPages.includes(pathname)) {
      visitedPages.push(pathname);
      trackingData.visited_pages = visitedPages;
      trackingData.pages_visited = visitedPages.length;

      // Sprawdź misję
      checkMissionProgress('pages_visited', visitedPages.length);
    }

    // Track specific pages
    if (pathname === '/') {
      trackingData.visit_home = 1;
      checkMissionProgress('visit_home', 1);
    }

    if (pathname === '/profil') {
      trackingData.visit_profile = 1;
      checkMissionProgress('visit_profile', 1);
    }

    if (pathname.startsWith('/gry')) {
      trackingData.visit_games = 1;
      checkMissionProgress('visit_games', 1);
    }

    // Track time spent
    const startTime = Date.now();
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackingData.time_spent = (trackingData.time_spent || 0) + 1;

      if (trackingData.time_spent >= 300) { // 5 minut
        checkMissionProgress('time_spent', trackingData.time_spent);
      }

      localStorage.setItem(trackingKey, JSON.stringify(trackingData));
    }, 1000);

    // Save tracking data
    localStorage.setItem(trackingKey, JSON.stringify(trackingData));

    return () => clearInterval(interval);
  }, [user, pathname]);

  return null; // Niewidoczny komponent
}
