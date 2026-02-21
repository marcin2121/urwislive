'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

// Domyślny stan
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  isLoading: true 
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    // 1. Pobierz aktualną sesję przy starcie
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // Jeśli jest błąd "Refresh Token Not Found", po prostu wyloguj lokalnie
        if (error) {
          console.warn("Sesja wygasła lub jest nieprawidłowa - czyszczenie.")
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error("Błąd inicjalizacji Auth:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 2. Nasłuchuj zmian (logowanie, wylogowanie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])
  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Wygodny hook do używania w innych plikach
export const useAuth = () => useContext(AuthContext)