'use client'

import { createClient } from '@/lib/supabase/client'

interface LocalStorageData {
  points?: string
  badges?: string
  history?: string
  missionProgress?: string
  streakData?: string
}

export async function migrateLocalStorageToSupabase(userId: string) {
  const supabase = createClient()

  try {
    // Get localStorage data
    const localStorageData: LocalStorageData = {
      points: localStorage.getItem('urwis_points') || '0',
      badges: localStorage.getItem('urwis_badges') || '[]',
      history: localStorage.getItem('urwis_history') || '[]',
      missionProgress: localStorage.getItem('urwis_mission_progress') || '{}',
      streakData: localStorage.getItem('urwis_streak_data') || '{}',
    }

    // FIX: Dodano fallbacki (|| '...') wewnątrz funkcji parsujących
    const points = parseInt(localStorageData.points || '0')
    const badges = JSON.parse(localStorageData.badges || '[]') as string[]
    const history = JSON.parse(localStorageData.history || '[]') as any[]
    const missionProgress = JSON.parse(localStorageData.missionProgress || '{}') as Record<string, any>
    const streakData = JSON.parse(localStorageData.streakData || '{}') as Record<string, any>

    // 1. Update profile with total exp/points
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        total_exp: points,
        level: calculateLevel(points),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // 2. Migrate points history
    if (history.length > 0) {
      const historyRecords = history.map((entry: any) => ({
        user_id: userId,
        amount: entry.amount,
        reason: entry.reason || 'Migrated from localStorage',
        created_at: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
      }))

      const { error: historyError } = await supabase.from('loyalty_points').insert(historyRecords)

      if (historyError) throw historyError
    }

    // 3. Migrate streak data
    if (Object.keys(streakData).length > 0) {
      const { error: streakError } = await supabase.from('user_streaks').upsert(
        {
          user_id: userId,
          current_streak: streakData.currentStreak || 0,
          best_streak: streakData.bestStreak || 0,
          last_activity_date: streakData.lastActivityDate ? new Date(streakData.lastActivityDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        },
        { onConflict: 'user_id' }
      )

      if (streakError) throw streakError
    }

    // 4. Clear localStorage after successful migration
    localStorage.removeItem('urwis_points')
    localStorage.removeItem('urwis_badges')
    localStorage.removeItem('urwis_history')
    localStorage.removeItem('urwis_mission_progress')
    localStorage.removeItem('urwis_streak_data')

    return { success: true, migratedData: { points, badgesCount: badges.length, historyCount: history.length } }
  } catch (error: any) {
    console.error('Migration error:', error)
    return { success: false, error: error.message }
  }
}

function calculateLevel(totalExp: number): number {
  if (totalExp < 100) return 1
  if (totalExp < 250) return 2
  if (totalExp < 500) return 3
  if (totalExp < 1000) return 4
  if (totalExp < 2000) return 5
  return 6
}
