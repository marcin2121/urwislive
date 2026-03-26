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
    if (!supabase) {
      setIsLoading(false);
      return;
    }

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // --- REJESTRACJA INSTALACJI PWA / APP ---
  useEffect(() => {
    const updatePwaStatus = async () => {
      if (!session || !user || !supabase) return;
      
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      
      if (isPWA && !user.user_metadata?.has_pwa) {
         try {
           await supabase.auth.updateUser({
             data: { has_pwa: true }
           });
         } catch(e) { console.error('PWA Update error', e) }
      }
    }
    updatePwaStatus()
  }, [session, user, supabase])

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Wygodny hook do używania w innych plikach
export const useAuth = () => useContext(AuthContext)