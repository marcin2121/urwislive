'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseAuth } from './SupabaseAuthContext'

interface UserStreak {
  id: string
  user_id: string
  current_streak: number
  best_streak: number
  last_activity_date: string
  streak_frozen: boolean
  freeze_used_at: string | null
  created_at: string
  updated_at: string
}

interface StreakContextType {
  streak: UserStreak | null
  loading: boolean
  error: string | null
  recordActivity: () => Promise<void>
  useFreeze: () => Promise<boolean>
  getStreakStatus: () => string
}

const StreakContext = createContext<StreakContextType | undefined>(undefined)

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user streak
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchStreak = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (data) {
          setStreak(data)
          // Check if streak should be reset
          checkAndResetStreak(data)
        } else {
          // Create new streak record
          const { data: newStreak, error: createError } = await supabase
            .from('user_streaks')
            .insert({
              user_id: user.id,
              current_streak: 0,
              best_streak: 0,
              last_activity_date: new Date().toISOString().split('T')[0],
              streak_frozen: false,
            })
            .select()
            .single()

          if (createError) throw createError
          setStreak(newStreak)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [user?.id])

  // Subscribe to real-time streak updates
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`streak-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          setStreak(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const checkAndResetStreak = (streakData: UserStreak) => {
    const lastActivityDate = new Date(streakData.last_activity_date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastActivityDateStr = lastActivityDate.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    // Reset streak if not active today or yesterday
    if (lastActivityDateStr !== yesterdayStr && lastActivityDateStr !== todayStr && !streakData.streak_frozen) {
      // Streak should be reset
      setStreak({
        ...streakData,
        current_streak: 0,
      })
    }
  }

  const recordActivity = useCallback(async () => {
    if (!user?.id || !streak) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const lastActivityDate = streak.last_activity_date

      let newStreakCount = streak.current_streak

      // Only increment if activity wasn't today
      if (lastActivityDate !== today) {
        newStreakCount = streak.current_streak + 1
      }

      const newBestStreak = Math.max(newStreakCount, streak.best_streak)

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreakCount,
          best_streak: newBestStreak,
          last_activity_date: today,
          streak_frozen: false,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setStreak({
        ...streak,
        current_streak: newStreakCount,
        best_streak: newBestStreak,
        last_activity_date: today,
      })
    } catch (err: any) {
      setError(err.message)
    }
  }, [user?.id, streak])

  const useFreeze = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !streak) return false

    try {
      // Check if user has freeze item
      const { data: items, error: itemsError } = await supabase
        .from('user_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'streak_freeze')
        .gt('quantity', 0)
        .maybeSingle()

      if (itemsError) throw itemsError

      if (!items) {
        setError('No freeze items available')
        return false
      }

      // Use freeze
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          streak_frozen: true,
          freeze_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Decrement item quantity
      const { error: itemError } = await supabase
        .from('user_items')
        .update({ quantity: items.quantity - 1 })
        .eq('id', items.id)

      if (itemError) throw itemError

      setStreak({
        ...streak,
        streak_frozen: true,
        freeze_used_at: new Date().toISOString(),
      })

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }, [user?.id, streak])

  const getStreakStatus = useCallback((): string => {
    if (!streak) return 'No streak'

    if (streak.streak_frozen) {
      return `Frozen (${streak.current_streak} day streak protected)`
    }

    return `${streak.current_streak} day streak (Best: ${streak.best_streak})`
  }, [streak])

  return (
    <StreakContext.Provider
      value={{
        streak,
        loading,
        error,
        recordActivity,
        useFreeze,
        getStreakStatus,
      }}
    >
      {children}
    </StreakContext.Provider>
  )
}

export function useStreak() {
  const context = useContext(StreakContext)
  if (!context) {
    throw new Error('useStreak must be used within StreakProvider')
  }
  return context
}
