'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  role?: 'user' | 'admin'; // Ścisła definicja ról
  points?: number; 
  exp?: number;     
  level?: number;   
  urwiski?: number; 
  kuleczki?: number;
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
  // --- KONFIGURACJA HARDCORE (WPISANA NA SZTYWNO) ---
  const [supabase] = useState(() => {
    const URL = "https://cfvxyqcsmskmnnoeykuo.supabase.co"
    const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnh5cWNzbXNrbW5ub2V5a3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDUwMTEsImV4cCI6MjA4NjY4MTAxMX0.Er8aRxeUgDcGPum1Ee_RZs1C04qkD5BFBBdc5za-mqA"
    
    console.log("🚀 SUPABASE INIT: Łączę z", URL)
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
      console.log("⏳ Inicjalizacja Auth...")
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) console.error("❌ Błąd sesji:", sessionError)

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          console.log("👤 Sesja:", initialSession ? "Zalogowany" : "Brak sesji")

          if (initialSession) {
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialSession.user.id)
              .single()
            
            if (profileError) console.error("❌ Błąd profilu:", profileError)
            if (data && !profileError) {
              console.log("✅ Profil pobrany:", data.username)
              setProfile(data as Profile)
            }
          }
        }
      } catch (error) {
        console.error('❌ Krytyczny błąd initializeAuth:', error)
      } finally {
        console.log("🏁 Koniec ładowania (loading = false)")
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("🔄 Zmiana stanu Auth:", event)
      if (!mounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession) {
        const { data } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single()
        setProfile(data as Profile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
    setUser(null)
    router.refresh()
    router.push('/')
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session?.user) return
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id)
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