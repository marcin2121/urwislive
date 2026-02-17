'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseAuth } from './SupabaseAuthContext'

interface Event {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  start_date: string
  end_date: string
  points_multiplier: number
  exp_multiplier: number
  created_at: string
}

interface UserEventParticipation {
  id: string
  user_id: string
  event_id: string
  points_earned: number
  exp_earned: number
  joined_at: string
}

interface EventsContextType {
  activeEvents: Event[]
  allEvents: Event[]
  userParticipation: UserEventParticipation[]
  loading: boolean
  error: string | null
  joinEvent: (eventId: string) => Promise<void>
  updateEventStats: (eventId: string, points: number, exp: number) => Promise<void>
  isEventActive: (event: Event) => boolean
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [activeEvents, setActiveEvents] = useState<Event[]>([])
  const [userParticipation, setUserParticipation] = useState<UserEventParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Zabezpieczenie przed Hydration Error
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const isEventActive = useCallback((event: Event): boolean => {
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    return startDate <= now && now <= endDate
  }, [])

  // Pobieranie wydarzeń
  useEffect(() => {
    if (!mounted) return

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: false })

        if (fetchError) throw fetchError

        setAllEvents(data)

        const now = new Date()
        const active = data.filter((event: Event) => {
          const startDate = new Date(event.start_date)
          const endDate = new Date(event.end_date)
          return startDate <= now && now <= endDate
        })

        setActiveEvents(active)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [mounted, supabase])

  // Pobieranie partycypacji użytkownika
  useEffect(() => {
    if (!mounted || !user?.id) return

    const fetchParticipation = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('user_event_participation')
          .select('*')
          .eq('user_id', user.id)

        if (fetchError) throw fetchError
        setUserParticipation(data)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchParticipation()
  }, [mounted, user?.id, supabase])

  // Subskrypcja Realtime
  useEffect(() => {
    if (!mounted) return

    const channel = supabase
      .channel('events-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload: any) => {
          setAllEvents((prev) => [payload.new, ...prev])
          if (isEventActive(payload.new)) {
            setActiveEvents((prev) => [payload.new, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mounted, supabase, isEventActive])

  const joinEvent = useCallback(
    async (eventId: string) => {
      if (!user?.id) return

      try {
        const existing = userParticipation.find((p) => p.event_id === eventId)
        if (existing) return

        const { error: joinError } = await supabase.from('user_event_participation').insert({
          user_id: user.id,
          event_id: eventId,
          points_earned: 0,
          exp_earned: 0,
        })

        if (joinError) throw joinError

        const { data, error: fetchError } = await supabase
          .from('user_event_participation')
          .select('*')
          .eq('user_id', user.id)

        if (fetchError) throw fetchError
        setUserParticipation(data)
      } catch (err: any) {
        setError(err.message)
      }
    },
    [user?.id, userParticipation, supabase]
  )

  const updateEventStats = useCallback(
    async (eventId: string, points: number, exp: number) => {
      if (!user?.id) return

      try {
        const participation = userParticipation.find(
          (p) => p.event_id === eventId && p.user_id === user.id
        )

        if (!participation) {
          await joinEvent(eventId)
          return
        }

        const { error: updateError } = await supabase
          .from('user_event_participation')
          .update({
            points_earned: (participation.points_earned || 0) + points,
            exp_earned: (participation.exp_earned || 0) + exp,
          })
          .eq('id', participation.id)

        if (updateError) throw updateError

        const { data, error: fetchError } = await supabase
          .from('user_event_participation')
          .select('*')
          .eq('user_id', user.id)

        if (fetchError) throw fetchError
        setUserParticipation(data)
      } catch (err: any) {
        setError(err.message)
      }
    },
    [user?.id, userParticipation, joinEvent, supabase]
  )

  return (
    <EventsContext.Provider
      value={{
        activeEvents,
        allEvents,
        userParticipation,
        loading,
        error,
        joinEvent,
        updateEventStats,
        isEventActive,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within EventsProvider')
  return context
}