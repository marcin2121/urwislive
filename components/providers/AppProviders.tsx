'use client'

import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SupabaseLoyaltyProvider } from "@/contexts/SupabaseLoyaltyContext";
import { LeaderboardProvider } from "@/contexts/LeaderboardContext";
import { AchievementsProvider } from "@/contexts/AchievementsContext";
import { StreakProvider } from "@/contexts/StreakContext";
import { EventsProvider } from "@/contexts/EventsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <SupabaseLoyaltyProvider>
        <LeaderboardProvider>
          <AchievementsProvider>
            <StreakProvider>
              <EventsProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </EventsProvider>
            </StreakProvider>
          </AchievementsProvider>
        </LeaderboardProvider>
      </SupabaseLoyaltyProvider>
    </SupabaseAuthProvider>
  );
}