'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { SupabaseLoyaltyProvider } from '@/contexts/SupabaseLoyaltyContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AchievementsProvider } from '@/contexts/AchievementsContext'; // Ensure this is hydration safe
import { LeaderboardProvider } from '@/contexts/LeaderboardContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { StreakProvider } from '@/contexts/StreakContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <SupabaseLoyaltyProvider>
        <NotificationProvider>
          <AchievementsProvider>
            <LeaderboardProvider>
              <EventsProvider>
                <StreakProvider>
                  {children}
                </StreakProvider>
              </EventsProvider>
            </LeaderboardProvider>
          </AchievementsProvider>
        </NotificationProvider>
      </SupabaseLoyaltyProvider>
    </SupabaseAuthProvider>
  );
}