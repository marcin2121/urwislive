'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseAuth } from './SupabaseAuthContext'

interface LeaderboardEntry {
  user_id: string
  username: string
  avatar_url: string | null
  score: number
  rank: number
  level: number
}

interface LeaderboardContextType {
  entries: LeaderboardEntry[]
  currentUserRank: number | null
  currentUserScore: number | null
  loading: boolean
  error: string | null
  updateScore: (score: number) => Promise<void>
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined)

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [currentUserScore, setCurrentUserScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        
        // Get top 100 users by exp
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, total_exp, level')
          .order('total_exp', { ascending: false })
          .limit(100)

        if (fetchError) throw fetchError

        const leaderboardData: LeaderboardEntry[] = data.map((item: any, index: number) => ({
          user_id: item.id,
          username: item.username,
          avatar_url: item.avatar_url,
          score: item.total_exp,
          rank: index + 1,
          level: item.level,
        }))

        setEntries(leaderboardData)

        // Find current user rank
        if (user) {
          const userEntry = leaderboardData.find((entry) => entry.user_id === user.id)
          if (userEntry) {
            setCurrentUserRank(userEntry.rank)
            setCurrentUserScore(userEntry.score)
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user?.id])

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload: any) => {
          setEntries((prev) => {
            const updated = prev.map((entry) => {
              if (entry.user_id === payload.new.id) {
                return {
                  ...entry,
                  score: payload.new.total_exp,
                  level: payload.new.level,
                  username: payload.new.username,
                }
              }
              return entry
            })
            
            // Re-sort by score
            return updated.sort((a, b) => b.score - a.score).map((entry, index) => ({
              ...entry,
              rank: index + 1,
            }))
          })

          // Update current user rank if changed
          if (user?.id === payload.new.id) {
            setCurrentUserScore(payload.new.total_exp)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const updateScore = async (score: number) => {
    if (!user) return

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_exp: score })
        .eq('id', user.id)

      if (updateError) throw updateError
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <LeaderboardContext.Provider
      value={{
        entries,
        currentUserRank,
        currentUserScore,
        loading,
        error,
        updateScore,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  )
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext)
  if (!context) {
    throw new Error('useLeaderboard must be used within LeaderboardProvider')
  }
  return context
}
