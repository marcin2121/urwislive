'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function interactWithUrwis(actionType: 'feed' | 'play') {
  const supabase = await createClient()
  
  // 1. Sprawdzenie autoryzacji
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Zaloguj się, aby zająć się Urwisem!' }
  }

  // 2. Pobranie obecnego stanu Urwisa
  const { data: pet, error: fetchError } = await supabase
    .from('urwis_pet')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (fetchError || !pet) {
    return { error: 'Nie znaleziono Twojego Urwisa.' }
  }

  // 3. Logika server-side (zabezpieczenie przed spamem)
  const now = new Date()
  const lastInteraction = new Date(pet.last_interaction)
  const diffInSeconds = (now.getTime() - lastInteraction.getTime()) / 1000

  if (diffInSeconds < 10) { // Cooldown 10 sekund
    return { error: 'Urwis musi chwilę odpocząć!' }
  }

  // 4. Aktualizacja statystyk w zależności od akcji
  let newHunger = pet.hunger_level
  let newHappiness = pet.happiness_level
  let pointsToAdd = 0

  if (actionType === 'feed') {
    newHunger = Math.min(100, newHunger + 15)
    pointsToAdd = 5
  } else if (actionType === 'play') {
    newHappiness = Math.min(100, newHappiness + 20)
    pointsToAdd = 10
  }

  // 5. Zapis w bazie danych
  const { error: updateError } = await supabase
    .from('urwis_pet')
    .update({
      hunger_level: newHunger,
      happiness_level: newHappiness,
      points_earned: pet.points_earned + pointsToAdd,
      last_interaction: now.toISOString()
    })
    .eq('user_id', user.id)

  if (updateError) return { error: 'Błąd połączenia z bazą.' }

  // 6. Odświeżenie widoku na frontendzie
  revalidatePath('/akademia')
  
  return { 
    success: true, 
    newState: { hunger: newHunger, happiness: newHappiness, points: pet.points_earned + pointsToAdd } 
  }
}