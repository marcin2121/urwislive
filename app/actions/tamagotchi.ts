'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateDecay, getXPForLevel } from '@/lib/urwis/engine'

export async function interactWithUrwis(actionType: 'feed' | 'play' | 'wash') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Zaloguj się!' }

  const { data: pet, error: fetchError } = await supabase
    .from('urwis_pet')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (fetchError || !pet) return { error: 'Nie znaleziono Urwiska.' }

  const now = new Date()
  
  // 1. BEZPIECZNE OBLICZANIE CZASU
  const lastUpdate = pet.last_interaction ? new Date(pet.last_interaction).getTime() : now.getTime();
  const secondsPassed = Math.floor((now.getTime() - lastUpdate) / 1000);

  // 2. PRZELICZENIE STANU (CATCH-UP)
  const currentHunger = calculateDecay(pet.hunger_level, secondsPassed);
  const currentHygiene = calculateDecay(pet.hygiene_level, secondsPassed);
  const currentHappiness = calculateDecay(pet.happiness_level, secondsPassed);

  // 3. BLOKADA 80%
  const statToUpgrade = actionType === 'feed' ? currentHunger : (actionType === 'wash' ? currentHygiene : currentHappiness);
  if (statToUpgrade >= 80) return { error: 'Urwis nie potrzebuje tego teraz!' }

  // 4. EKONOMIA I XP
  const dateField = actionType === 'feed' ? 'last_fed_at' : (actionType === 'wash' ? 'last_washed_at' : 'last_played_at');
  const lastActionDate = pet[dateField] ? new Date(pet[dateField]) : new Date(0);
  const isFirstThisActionToday = lastActionDate.toDateString() !== now.toDateString();

  let coinDelta = 0;
  let expToAdd = 50;
  const currentLvl = pet.level || 1;
  const nextLvlThreshold = getXPForLevel(currentLvl);

  if (isFirstThisActionToday) expToAdd = Math.floor(nextLvlThreshold * 0.0833);

  if (actionType === 'feed') {
    coinDelta = -40;
    if ((pet.urwis_coins || 0) < 40) return { error: 'Masz za mało monet (potrzeba 40)!' }
  } else {
    coinDelta = 20;
    if (isFirstThisActionToday) coinDelta += 20;
  }

  // 5. LEVEL UP
  let newTotalExp = (pet.points_earned || 0) + expToAdd;
  let newLvl = currentLvl;
  let leveledUp = false;
  let goldenUrwisAdd = 0;

  if (newTotalExp >= nextLvlThreshold) {
    leveledUp = true;
    newLvl += 1;
    newTotalExp -= nextLvlThreshold;
    goldenUrwisAdd = 5;
    coinDelta += 100;
  }

  // 6. ZAPIS DO BAZY (DOKŁADNE POLA)
  const updates = {
    urwis_coins: Math.floor(Math.max(0, (pet.urwis_coins || 0) + coinDelta)),
    golden_urwis: Math.floor((pet.golden_urwis || 0) + goldenUrwisAdd),
    points_earned: Math.floor(newTotalExp),
    level: Math.floor(newLvl),
    last_interaction: now.toISOString(),
    [dateField]: now.toISOString(),
    // Zaokrąglamy statystyki do liczb całkowitych dla Supabase
    hunger_level: Math.round(actionType === 'feed' ? Math.min(100, currentHunger + 20) : currentHunger),
    hygiene_level: Math.round(actionType === 'wash' ? Math.min(100, currentHygiene + 20) : currentHygiene),
    happiness_level: Math.round(actionType === 'play' ? Math.min(100, currentHappiness + 20) : currentHappiness),
  }

  const { error: updateError } = await supabase.from('urwis_pet').update(updates).eq('user_id', user.id);

  if (updateError) {
    console.error('BŁĄD SUPABASE:', updateError);
    return { error: `Błąd zapisu: ${updateError.message}` }
  }

  revalidatePath('/urwisek')

  return { 
    success: true, 
    leveledUp,
    reward: { coins: coinDelta, exp: expToAdd, isDailyBonus: isFirstThisActionToday },
    newState: {
      hunger: updates.hunger_level,
      hygiene: updates.hygiene_level,
      happiness: updates.happiness_level,
      urwisCoins: updates.urwis_coins,
      level: updates.level,
      points_earned: updates.points_earned,
      goldenUrwis: updates.golden_urwis,
      // DODAJEMY TO POLE - Klucz do braku skakania!
      lastInteraction: updates.last_interaction 
    }
  }
}
export async function claimDailyLogin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Zaloguj se!' }

  const { data: pet } = await supabase.from('urwis_pet').select('urwis_coins, last_login_at').eq('user_id', user.id).single()
  if (!pet) return { error: 'Brak Urwiska.' }

  const now = new Date()
  const lastLogin = pet.last_login_at ? new Date(pet.last_login_at) : new Date(0)

  if (lastLogin.toDateString() === now.toDateString()) {
    return { success: false, message: 'Bonus już odebrany.' }
  }

  const { error } = await supabase.from('urwis_pet').update({
    urwis_coins: (pet.urwis_coins || 0) + 50,
    last_login_at: now.toISOString()
  }).eq('user_id', user.id)

  if (error) return { error: 'Błąd.' }

  revalidatePath('/urwisek')
  return { success: true, amount: 50 }
}

export async function createUrwisPet(playerName: string, petName: string, gender: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany!' }
  
  if (!playerName || playerName.trim().length < 3) return { error: 'Twoje imię musi mieć co najmniej 3 znaki.' }
  if (!petName || petName.trim().length < 3) return { error: 'Imię Urwisa musi mieć co najmniej 3 znaki.' }
  if (!['boy', 'girl'].includes(gender)) return { error: 'Wybierz płeć swojego bohatera.' }

  const { error } = await supabase.from('urwis_pet').insert({
    user_id: user.id,
    player_name: playerName.trim(),
    name: petName.trim(),
    gender: gender,
    level: 1,
    hunger_level: 100,
    happiness_level: 100,
    hygiene_level: 100,
    points_earned: 0,
    urwis_coins: 0,
    golden_urwis: 0,
    last_interaction: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  })

  if (error) {
    if (error.code === '23505' && error.message.includes('unique_player_name')) {
      return { error: 'Ta nazwa jest już zajęta! 😎' }
    }
    return { error: 'Błąd zapisu.' }
  }

  revalidatePath('/urwisek')
  return { success: true }
}