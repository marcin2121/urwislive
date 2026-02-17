'use client'

const STORAGE_KEY = 'urwis_guest_xp'
const MAX_TRANSFER_CAP = 1000 // Zabezpieczenie: Max XP jakie można przenieść (np. poziom 2)

export const GuestProgress = {
  // Pobiera aktualne XP gościa
  getXP: (): number => {
    if (typeof window === 'undefined') return 0
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : 0
  },

  // Dodaje XP (używane po wygranej grze)
  addXP: (amount: number) => {
    if (typeof window === 'undefined') return
    const current = GuestProgress.getXP()
    const safeAmount = Math.max(0, amount) // Zabezpieczenie przed ujemnym
    localStorage.setItem(STORAGE_KEY, (current + safeAmount).toString())
  },

  // Zwraca XP do transferu z nałożonym limitem (Anti-Cheat)
  getXPForTransfer: (): number => {
    const current = GuestProgress.getXP()
    // Tutaj jest magia bezpieczeństwa:
    // Nawet jak ktoś wpisze milion, dostanie tylko MAX_TRANSFER_CAP
    return Math.min(current, MAX_TRANSFER_CAP)
  },

  // Czyści po udanym transferze
  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}