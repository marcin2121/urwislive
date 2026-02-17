'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Star, Gift, PartyPopper } from 'lucide-react'
import { useRouter } from 'next/navigation'
// --- TYPY ---
export type NotificationType = 'success' | 'level-up' | 'mission' | 'reward' | 'info'

export interface UrwisNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  actionLabel?: string
  onAction?: () => void
}

// --- GLOBALNY EVENT EMITTER (prosty observer) ---
// To pozwala wywoływać powiadomienia z dowolnego miejsca w kodzie bez Contextu
type Listener = (notification: UrwisNotification) => void
let listeners: Listener[] = []

export const urwisToast = {
  add: (notification: Omit<UrwisNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    listeners.forEach(l => l({ ...notification, id }))
  },

  // AWANS POZIOMU -> Przekierowanie do /profil
  levelUp: (level: number) => {
    urwisToast.add({
      type: 'level-up',
      title: 'POZIOM W GÓRĘ! 🎉',
      message: `Gratulacje! Osiągnąłeś poziom ${level}!`,
      duration: 8000,
      actionLabel: 'Zobacz profil',
      onAction: () => { window.dispatchEvent(new CustomEvent('urwis-nav', { detail: '/profil' })) }
    })
  },

  // MISJA / NAGRODA -> Przekierowanie do /misje lub /nagrody
  missionComplete: (missionName: string, xp: number) => {
    urwisToast.add({
      type: 'mission',
      title: 'Misja Wykonana!',
      message: `${missionName} (+${xp} XP)`,
      duration: 5000,
      actionLabel: 'Moje Misje',
      onAction: () => { window.dispatchEvent(new CustomEvent('urwis-nav', { detail: '/misje' })) }
    })
  },

  dailyReward: () => {
    urwisToast.add({
      type: 'reward',
      title: 'Nagroda Czeka!',
      message: 'Twój dzienny bonus jest gotowy do odebrania.',
      duration: 10000,
      actionLabel: 'Odbierz nagrodę',
      onAction: () => { window.dispatchEvent(new CustomEvent('urwis-nav', { detail: '/nagrody' })) }
    })
  }
}
// --- KOMPONENT UI ---
export default function UrwisNotifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<UrwisNotification[]>([])
  useEffect(() => {
    const handleNav = (e: any) => {
      router.push(e.detail)
    }
  
    window.addEventListener('urwis-nav', handleNav)
    return () => window.removeEventListener('urwis-nav', handleNav)
  }, [router])
  useEffect(() => {
    const handler = (newNote: UrwisNotification) => {
      setNotifications(prev => [...prev, newNote])

      // Auto-usuwanie
      if (newNote.duration !== 0) {
        setTimeout(() => {
          removeNotification(newNote.id)
        }, newNote.duration || 5000)
      }
    }

    listeners.push(handler)
    return () => { listeners = listeners.filter(l => l !== handler) }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Ikony dla typów
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'level-up': return <PartyPopper className="text-yellow-500" size={32} />
      case 'mission': return <Trophy className="text-purple-500" size={24} />
      case 'reward': return <Gift className="text-pink-500" size={24} />
      default: return <Star className="text-blue-500" size={24} />
    }
  }

  // Kolory tła
  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'level-up': return 'bg-yellow-50 border-yellow-200'
      case 'mission': return 'bg-purple-50 border-purple-200'
      case 'reward': return 'bg-pink-50 border-pink-200'
      default: return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map(note => (
          <motion.div
          key={note.id}
          onClick={() => {
            if (note.onAction) {
              note.onAction()
              removeNotification(note.id)
            }
          }}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            layout
            className={`
              cursor-pointer pointer-events-auto w-80 p-4 rounded-2xl shadow-xl border-2 
    flex items-start gap-4 backdrop-blur-md hover:scale-105 transition-transform
    ${getBgColor(note.type)}
            `}
          >
            <div className="shrink-0 pt-1 bg-white p-2 rounded-full">
              {getIcon(note.type)}
            </div>

            <div className="flex-1">
              <h4 className="font-black text-gray-800 text-sm uppercase tracking-wide">
                {note.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1 leading-snug">
                {note.message}
              </p>

              {note.actionLabel && (
                <button
                  onClick={() => {
                    note.onAction?.()
                    removeNotification(note.id)
                  }}
                  className="mt-3 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                >
                  {note.actionLabel}
                </button>
              )}
            </div>

            <button
              onClick={() => removeNotification(note.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}