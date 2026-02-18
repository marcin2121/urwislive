'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  points?: number; 
  exp?: number;     
  level?: number;   
  urwiski?: number; 
  kuleczki?: number;
  theme_color?: string;
  bio?: string;
  status_tag?: string;
}

interface AuthContextType {
  supabase: SupabaseClient
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined)

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => {
    const URL = "https://cfvxyqcsmskmnnoeykuo.supabase.co"
    const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnh5cWNzbXNrbW5ub2V5a3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDUwMTEsImV4cCI6MjA4NjY4MTAxMX0.Er8aRxeUgDcGPum1Ee_RZs1C04qkD5BFBBdc5za-mqA"
    return createBrowserClient(URL, KEY)
  })

  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)

          if (initialSession?.user) {
            // maybeSingle() nie rzuca błędu, gdy profilu jeszcze nie ma (np. w trakcie rejestracji)
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialSession.user.id)
              .maybeSingle()
            
            if (!profileError && profileData && mounted) {
              setProfile(profileData as Profile)
            }
          }
        }
      } catch (error: any) {
        // WYCISZENIE BŁĘDU PRZERWANIA: Next.js 15 / React 18+ w Strict Mode przerywa pierwsze żądanie
        if (error.name === 'AbortError' || error.message?.includes('signal is aborted')) {
          return; 
        }
        console.error('❌ Błąd inicjalizacji Auth:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .maybeSingle()
        
        if (mounted) setProfile(data as Profile)
      } else {
        if (mounted) setProfile(null)
      }
      
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setProfile(null)
      setSession(null)
      setUser(null)
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Błąd wylogowania:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session?.user) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
      
      if (error) throw error
      
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      router.refresh()
    } catch (error) {
      console.error('Błąd aktualizacji profilu:', error)
      throw error
    }
  }

  return (
    <SupabaseAuthContext.Provider value={{ supabase, session, user, profile, loading, signOut, updateProfile }}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  return context
}