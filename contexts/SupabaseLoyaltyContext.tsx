'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSupabaseAuth } from './SupabaseAuthContext'
import { createClient } from '@/lib/supabase/client'

interface LoyaltyContextType {
  points: number
  totalExp: number
  level: number
  pointsHistory: any[]
  expHistory: any[]
  addPoints: (amount: number, reason: string) => Promise<void>
  spendPoints: (amount: number, reason: string) => Promise<void>
  addExp: (amount: number, reason: string) => Promise<void>
  loading: boolean
  error: string | null
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined)

export function SupabaseLoyaltyProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  const [points, setPoints] = useState(0)
  const [totalExp, setTotalExp] = useState(0)
  const [level, setLevel] = useState(1)
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [expHistory, setExpHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('points, total_exp, level')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        setPoints(profileData?.points || 0)
        setTotalExp(profileData?.total_exp || 0)
        setLevel(profileData?.level || 1)

        // Fetch points history
        const { data: pointsData } = await supabase
          .from('points_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        setPointsHistory(pointsData || [])

        // Fetch exp history
        const { data: expData } = await supabase
          .from('exp_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        setExpHistory(expData || [])

      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching loyalty data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`loyalty-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          setPoints(payload.new.points || 0)
          setTotalExp(payload.new.total_exp || 0)
          setLevel(payload.new.level || 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'points_history',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          setPointsHistory(prev => [payload.new, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'exp_history',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          setExpHistory(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id])

  const addPoints = useCallback(
    async (amount: number, reason: string) => {
      if (!user?.id) return
      setError(null)

      try {
        const { data, error } = await supabase.rpc('add_loyalty_points', {
          p_user_id: user.id,
          p_amount: amount,
          p_reason: reason
        })

        if (error) throw error

        setPoints(data.new_balance)
        console.log(`✅ Added ${amount} points: ${reason}`)
      } catch (err: any) {
        setError(err.message)
        console.error('❌ Error adding points:', err)
      }
    },
    [user?.id, supabase]
  )

  const spendPoints = useCallback(
    async (amount: number, reason: string) => {
      if (!user?.id) return
      setError(null)

      try {
        const { data, error } = await supabase.rpc('spend_loyalty_points', {
          p_user_id: user.id,
          p_amount: amount,
          p_reason: reason
        })

        if (error) throw error

        setPoints(data.new_balance)
        console.log(`✅ Spent ${amount} points: ${reason}`)
      } catch (err: any) {
        setError(err.message)
        console.error('❌ Error spending points:', err)
      }
    },
    [user?.id, supabase]
  )

  const addExp = useCallback(
    async (amount: number, reason: string) => {
      if (!user?.id) return
      setError(null)

      try {
        const { data, error } = await supabase.rpc('add_experience', {
          p_user_id: user.id,
          p_amount: amount,
          p_reason: reason
        })

        if (error) throw error

        setTotalExp(data.new_total)
        setLevel(data.new_level)

        if (data.leveled_up) {
          console.log(`🎉 LEVEL UP! ${data.old_level} → ${data.new_level}`)
          // TODO: Show toast notification
        }
      } catch (err: any) {
        setError(err.message)
        console.error('❌ Error adding exp:', err)
      }
    },
    [user?.id, supabase]
  )

  return (
    <LoyaltyContext.Provider
      value={{
        points,
        totalExp,
        level,
        pointsHistory,
        expHistory,
        addPoints,
        spendPoints,
        addExp,
        loading,
        error,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  )
}

export function useSupabaseLoyalty() {
  const context = useContext(LoyaltyContext)
  if (!context) {
    throw new Error('useSupabaseLoyalty must be used within SupabaseLoyaltyProvider')
  }
  return context
}
