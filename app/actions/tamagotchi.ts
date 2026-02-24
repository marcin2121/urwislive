'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- FUNKCJE POMOCNICZE ---

const getXPForLevel = (level: number) => Math.floor(500 * Math.pow(1.2, level - 1));

// Ta funkcja musi być identyczna z tą w page.tsx
function calculateServerDecay(val: number, secondsPassed: number) {
  let currentVal = val;
  for (let i = 0; i < secondsPassed; i++) {
    let decay = 0.00034; // Faza 5
    if (currentVal > 80) decay = 0.0222;      // Faza 1
    else if (currentVal > 60) decay = 0.0055; // Faza 2
    else if (currentVal > 45) decay = 0.0015; // Faza 3
    else if (currentVal > 30) decay = 0.0010; // Faza 4
    
    currentVal = Math.max(0, currentVal - decay);
    if (currentVal <= 0) break;
  }
  return currentVal;
}

// --- GŁÓWNE AKCJE ---

export async function interactWithUrwis(actionType: 'feed' | 'play' | 'wash') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Zaloguj się!' }

  const { data: pet } = await supabase.from('urwis_pet').select('*').eq('user_id', user.id).single()
  if (!pet) return { error: 'Nie znaleziono Urwiska.' }

  const now = new Date()
  
  // 1. OBLICZAMY ILE CZASU MINĘŁO OD OSTATNIEGO ZAPISU W BAZIE
  const lastUpdate = new Date(pet.last_interaction);
  const secondsPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

  // 2. PRZELICZAMY AKTUALNY STAN (nadrabiamy spadek)
  const currentHunger = calculateServerDecay(pet.hunger_level, secondsPassed);
  const currentHygiene = calculateServerDecay(pet.hygiene_level, secondsPassed);
  const currentHappiness = calculateServerDecay(pet.happiness_level, secondsPassed);

  // 3. SPRAWDZAMY BLOKADĘ 80% NA PRZELICZONYCH WARTOŚCIACH
  const statToUpgrade = 
    actionType === 'feed' ? currentHunger : 
    actionType === 'wash' ? currentHygiene : 
    currentHappiness;

  if (statToUpgrade >= 80) {
    return { error: 'Urwis nie potrzebuje tego teraz!' }
  }

  // 4. LOGIKA NAGRÓD (XP I MONETY)
  const dateField = actionType === 'feed' ? 'last_fed_at' : (actionType === 'wash' ? 'last_washed_at' : 'last_played_at');
  const lastActionDate = pet[dateField] ? new Date(pet[dateField]) : new Date(0);
  const isFirstThisActionToday = lastActionDate.toDateString() !== now.toDateString();

  let coinDelta = 0;
  let expToAdd = 50; 

  const currentLvl = pet.level || 1;
  const nextLvlThreshold = getXPForLevel(currentLvl);

  if (isFirstThisActionToday) {
    // 8.33% całego poziomu bonusu
    expToAdd = Math.floor(nextLvlThreshold * 0.0833);
  }

  if (actionType === 'feed') {
    coinDelta = -40;
    if ((pet.urwis_coins || 0) < 40) return { error: 'Brak monet!' }
  } else {
    coinDelta = 20;
    if (isFirstThisActionToday) coinDelta += 20; 
  }

  // 5. LOGIKA LEVEL UP
  let newTotalExp = (pet.points_earned || 0) + expToAdd
  let newLvl = currentLvl
  let leveledUp = false
  let goldenUrwisAdd = 0

  if (newTotalExp >= nextLvlThreshold) {
    leveledUp = true
    newLvl += 1
    newTotalExp -= nextLvlThreshold 
    goldenUrwisAdd = 5
    coinDelta += 100 
  }

  // 6. PRZYGOTOWANIE ZAPISU (Przeliczony stan + Bonus 20%)
  const updates: any = {
    urwis_coins: Math.max(0, (pet.urwis_coins || 0) + coinDelta),
    golden_urwis: (pet.golden_urwis || 0) + goldenUrwisAdd,
    points_earned: newTotalExp,
    level: newLvl,
    last_interaction: now.toISOString(),
    [dateField]: now.toISOString(),
    // Ważne: Zapisujemy decayed value + 20%
    hunger_level: actionType === 'feed' ? Math.min(100, currentHunger + 20) : currentHunger,
    hygiene_level: actionType === 'wash' ? Math.min(100, currentHygiene + 20) : currentHygiene,
    happiness_level: actionType === 'play' ? Math.min(100, currentHappiness + 20) : currentHappiness,
  }

  const { error } = await supabase.from('urwis_pet').update(updates).eq('user_id', user.id)
  if (error) return { error: 'Błąd zapisu.' }

  revalidatePath('/urwisek')
  return { 
    success: true, 
    leveledUp,
    reward: { 
      coins: coinDelta, 
      exp: expToAdd, 
      isDailyBonus: isFirstThisActionToday 
    },
    newState: { 
      ...updates, 
      urwisCoins: updates.urwis_coins,
      points_earned: newTotalExp
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