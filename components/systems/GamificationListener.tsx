'use client'

import { useEffect, useRef } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { urwisToast } from '@/components/ui/UrwisNotifications'
import confetti from 'canvas-confetti'

export default function GamificationListener() {
  const { profile } = useSupabaseAuth()

  // Refy do śledzenia poprzedniego stanu
  // PrevLevel może być null (przed inicjalizacją) lub number
  const prevLevelRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  // 1. Wykrywanie Level Up
  useEffect(() => {
    // SECURITY CHECK: Jeśli profil nie istnieje lub level jest undefined, przerywamy
    if (!profile || typeof profile.level !== 'number') return

    // Przypisujemy do zmiennej, aby TS wiedział, że to na pewno number
    const currentLevel = profile.level

    // Jeśli to pierwsze załadowanie, tylko zapisz poziom
    if (prevLevelRef.current === null) {
      prevLevelRef.current = currentLevel
      initializedRef.current = true

      // Przy okazji pierwszego wejścia: sprawdź czy są nagrody
      checkDailyRewards(profile)
      return
    }

    // Sprawdź czy poziom wzrósł (porównujemy number do number)
    if (currentLevel > prevLevelRef.current) {
      // LEVEL UP!
      triggerLevelUpEffect(currentLevel)
      prevLevelRef.current = currentLevel
    }

  }, [profile]) 

  // --- LOGIKA POMOCNICZA ---

  const triggerLevelUpEffect = (level: number) => {
    // 1. Toast
    urwisToast.levelUp(level)

    // 2. Dźwięk (opcjonalnie)
    const audio = new Audio('/sounds/win.mp3')
    audio.volume = 0.5
    audio.play().catch(() => { })

    // 3. Wielkie confetti
    const duration = 3000
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500'] 
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()
  }

  const checkDailyRewards = (userProfile: any) => {
    if (!userProfile.last_daily_reward) {
      urwisToast.dailyReward()
      return
    }

    const lastClaim = new Date(userProfile.last_daily_reward)
    const today = new Date()

    lastClaim.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    if (today > lastClaim) {
      setTimeout(() => {
        urwisToast.dailyReward()
      }, 2000)
    }
  }

  return null 
}