'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateDecay, getXPForLevel } from '@/lib/urwis/engine'
import { SHOP_ITEMS } from '@/lib/urwis/items'
import { checkAchievements } from '@/lib/urwis/achievements'

export async function interactWithUrwis(actionType: 'feed' | 'play' | 'wash') {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd konfiguracji bazy danych.' }
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

  if (isFirstThisActionToday) {
    expToAdd = Math.floor(nextLvlThreshold * 0.0833);
  }

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
  const updates: any = {
    urwis_coins: Math.floor(Math.max(0, (pet.urwis_coins || 0) + coinDelta)),
    golden_urwis: Math.floor((pet.golden_urwis || 0) + goldenUrwisAdd),
    points_earned: Math.floor(newTotalExp),
    level: Math.floor(newLvl),
    last_interaction: now.toISOString(),
    [dateField]: now.toISOString(),
    hunger_level: Math.round(actionType === 'feed' ? Math.min(100, currentHunger + 20) : currentHunger),
    hygiene_level: Math.round(actionType === 'wash' ? Math.min(100, currentHygiene + 20) : currentHygiene),
    happiness_level: Math.round(actionType === 'play' ? Math.min(100, currentHappiness + 20) : currentHappiness),
  }

  // --- ACHIEVEMENT CHECK ---
  const currentPetStateForAchievements = {
    ...pet,
    level: Math.floor(newLvl),
    urwis_coins: Math.floor(Math.max(0, (pet.urwis_coins || 0) + coinDelta))
  };
  const { newUnlocks, pointsGained } = checkAchievements(currentPetStateForAchievements, actionType);
  if (newUnlocks.length > 0) {
     updates.achievements = [...(pet.achievements || []), ...newUnlocks];
     updates.achievement_points = (pet.achievement_points || 0) + pointsGained;
  }

  // --- QUEST PROGRESS ---
  const qProgress = pet.quest_progress || {};
  let questId = '';
  if (actionType === 'feed') questId = 'q_feed_3';
  if (actionType === 'play') questId = 'q_play';
  if (actionType === 'wash') questId = 'q_wash_3';
  
  if (questId) {
    updates.quest_progress = { ...qProgress, [questId]: (qProgress[questId] || 0) + 1 };
  }

  const { error: updateError } = await supabase.from('urwis_pet').update(updates).eq('user_id', user.id);

  if (updateError) {
    console.error('BŁĄD SUPABASE:', updateError);
    return { error: `Błąd zapisu: ${updateError.message}` }
  }

  return {
    success: true,
    leveledUp,
    reward: { coins: coinDelta, exp: expToAdd, isDailyBonus: isFirstThisActionToday },
    newAchievements: newUnlocks,
    newState: {
      hunger: updates.hunger_level,
      hygiene: updates.hygiene_level,
      happiness: updates.happiness_level,
      urwisCoins: updates.urwis_coins,
      level: updates.level,
      points_earned: updates.points_earned,
      goldenUrwis: updates.golden_urwis,
      lastInteraction: updates.last_interaction,
      inventory: pet.inventory || [],
      equippedItems: pet.equipped_items || {},
      achievements: updates.achievements || pet.achievements || [],
      achievementPoints: updates.achievement_points || pet.achievement_points || 0,
      questProgress: updates.quest_progress || pet.quest_progress || {}
    }
  }
}

export async function claimDailyLogin() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd serwera.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Zaloguj się!' }

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

  revalidatePath('/strefa-zabawy/urwisek')
  return { success: true, amount: 50 }
}

export async function createUrwisPet(playerName: string, petName: string, gender: string) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd połączenia.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany!' }
  
 // Zmień te linijki:
if (!playerName || playerName.trim().length < 3 || playerName.length > 30) {
    return { error: 'Twoje imię musi mieć od 3 do 30 znaków.' }
  }
  if (!petName || petName.trim().length < 3 || petName.length > 30) {
    return { error: 'Imię Urwisa musi mieć od 3 do 30 znaków.' }
  }
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

  revalidatePath('/strefa-zabawy/urwisek')
  return { success: true }
}

export async function getUrwisRanking() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd bazy danych.' }
  
  const { data, error } = await supabase
    .from('urwis_pet')
    .select('player_name, name, level, points_earned, gender, achievement_points')
    .order('achievement_points', { ascending: false })
    .order('level', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Błąd pobierania rankingu:', error)
    return { error: 'Nie udało się pobrać rankingu.' }
  }

  return { success: true, ranking: data }
}

// ==========================================
// SYSTEM RANKINGOWY KULEK (BUBBLE SHOOTER)
// ==========================================

export async function submitBubbleShooterScore(playerName: string, score: number, level: number) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: false }
    const { error } = await supabase
      .from('bubble_shooter_scores')
      .insert({
        player_name: playerName,
        score: score,
        level: level
      })
      
    if (error) {
       console.error('Failed to submit score', error)
       return { success: false }
    }
    
    // Inwaliduj cache gdy uaktualniono wynik
    revalidatePath('/strefa-zabawy/lece-w-kulki');
    
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function getBubbleShooterRanking(currentScore?: number) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: true, topScores: [] }
    
    // Zwykłe TOP 10 po dacie i statystykach
    const { data: topPlayers, error } = await supabase
      .from('bubble_shooter_scores')
      .select('id, player_name, score, level, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (error || !topPlayers) {
       return { success: true, topScores: [] }
    }
    
    let statsMessage = null;
    
    // Oblicz dystans do top 3 dla aktualnych wyników (z ekranu gry do wiadomości gracza)
    if (currentScore !== undefined && topPlayers.length > 0) {
        let position = topPlayers.findIndex((p: { score: number }) => p.score <= currentScore!) + 1;
        if (position === 0) { 
           // Gorszy niż top 10 = trzeba zgadywać estymując count lub położyć jako "Ponizej Top 10"
           position = 11; 
        }
        
        const top3ScoreThreshold = topPlayers.length >= 3 ? topPlayers[2].score : (topPlayers[topPlayers.length-1]?.score || 0);

        if (position <= 3) {
            statsMessage = `Brawo! Wbiłeś na podium ${position} Miejsce!`;
        } else {
            const diff = top3ScoreThreshold - currentScore;
            statsMessage = diff > 0 
               ? `Do 3 Miejsca zabrakło Ci ${diff} punktów!`
               : `Jesteś poza dziesiątką, popraw się!`;
        }
    }

    return { 
       success: true, 
       topScores: topPlayers,
       statsMessage 
    }

  } catch (error) {
    return { success: false, topScores: [] }
  }
}

// ==========================================
// SYSTEM RANKINGOWY KLOCKÓW (ARKANOID)
// ==========================================

export async function submitArkanoidScore(playerName: string, score: number, level: number) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: false }
    const { error } = await supabase
      .from('arkanoid_scores')
      .insert({
        player_name: playerName,
        score: score,
        level: level
      })
      
    if (error) {
       console.error('Failed to submit arkanoid score', error)
       return { success: false }
    }
    
    // Inwaliduj cache gdy uaktualniono wynik
    revalidatePath('/strefa-zabawy/urwis-breaker');
    
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function getArkanoidRanking(currentScore?: number) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: true, topScores: [] }
    
    const { data: topPlayers, error } = await supabase
      .from('arkanoid_scores')
      .select('id, player_name, score, level, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (error || !topPlayers) {
       return { success: true, topScores: [] }
    }
    
    let statsMessage = null;
    
    if (currentScore !== undefined && topPlayers.length > 0) {
        let position = topPlayers.findIndex((p: { score: number }) => p.score <= currentScore!) + 1;
        if (position === 0) position = 11; 
        
        const top3ScoreThreshold = topPlayers.length >= 3 ? topPlayers[2].score : (topPlayers[topPlayers.length-1]?.score || 0);

        if (position <= 3) {
            statsMessage = `Brawo! Wbiłeś na podium ${position} Miejsce!`;
        } else {
            const diff = top3ScoreThreshold - currentScore;
            statsMessage = diff > 0 
               ? `Do 3 Miejsca zabrakło Ci ${diff} punktów!`
               : `Jesteś poza dziesiątką, popraw się!`;
        }
    }

    return { 
       success: true, 
       topScores: topPlayers,
       statsMessage 
    }

  } catch (error) {
    return { success: false, topScores: [] }
  }
}

export async function buyUrwisItem(itemId: string) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd konfiguracji.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany!' }

  const itemDef = SHOP_ITEMS.find(i => i.id === itemId)
  if (!itemDef) return { error: 'Przedmiot nie istnieje.' }

  const { data: pet } = await supabase.from('urwis_pet')
    .select('level, urwis_coins, inventory, hunger_level, achievements, achievement_points, quest_progress')
    .eq('user_id', user.id).single()

  if (!pet) return { error: 'Nie znaleziono maskotki.' }

  if ((pet.level || 1) < itemDef.requiredLevel) {
     return { error: `Wymaga ${itemDef.requiredLevel} poziomu, by zakupić!` }
  }

  const currentCoins = pet.urwis_coins || 0
  if (currentCoins < itemDef.price) return { error: 'Brak wystarczającej liczby monet.' }

  const updates: any = {
    urwis_coins: currentCoins - itemDef.price
  }

  // ITEMY trafia na stałe do ekwipunku
  const inv = pet.inventory || []
  if (inv.includes(itemId)) return { error: 'Już posiadasz ten przedmiot!' }
  updates.inventory = [...inv, itemId]

  // --- ACHIEVEMENT CHECK ---
  const currentPetStateForAchievements = {
    ...pet,
    urwis_coins: updates.urwis_coins
  };
  const { newUnlocks, pointsGained } = checkAchievements(currentPetStateForAchievements, 'buy');
  if (newUnlocks.length > 0) {
     updates.achievements = [...(pet.achievements || []), ...newUnlocks];
     updates.achievement_points = (pet.achievement_points || 0) + pointsGained;
  }

  // --- QUEST PROGRESS ---
  const qProgress = pet.quest_progress || {};
  updates.quest_progress = { ...qProgress, 'q_shop_2': (qProgress['q_shop_2'] || 0) + 1 };

  const { error } = await supabase.from('urwis_pet').update(updates).eq('user_id', user.id)
  if (error) return { error: 'Błąd podczas płatności.' }

  revalidatePath('/strefa-zabawy/urwisek')
  return { success: true, updates, newAchievements: newUnlocks }
}

export async function toggleUrwisItem(itemId: string, category: string) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd serwera.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany!' }

  const { data: pet } = await supabase.from('urwis_pet')
    .select('inventory, equipped_items')
    .eq('user_id', user.id).single()

  if (!pet || !(pet.inventory || []).includes(itemId)) {
    return { error: 'Nie posiadasz tego przedmiotu!' }
  }

  const currentEq = pet.equipped_items || {}
  
  // Mechanizm Togglowania - jeśli ubrane to deaktywuj, jeśli inne to nadpisz.
  if (currentEq[category] === itemId) {
    delete currentEq[category]
  } else {
    currentEq[category] = itemId
  }

  const { error } = await supabase.from('urwis_pet').update({ equipped_items: currentEq }).eq('user_id', user.id)
  if (error) return { error: 'Nie udało się przebrać Urwiska.' }

  revalidatePath('/strefa-zabawy/urwisek')
  return { success: true, equippedItems: currentEq }
}

export async function finishArcadeGame(gameId: string) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd bazy danych.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany!' }

  const { data: pet } = await supabase.from('urwis_pet')
    .select('urwis_coins, points_earned, level, achievements, achievement_points, quest_progress')
    .eq('user_id', user.id).single()

  if (!pet) return { error: 'Nie znaleziono maskotki.' }

  let coinsEarned = 0
  let expEarned = 0
  if (gameId === 'memory') {
    coinsEarned = 15
    expEarned = 20
  } else if (gameId === 'bubble_shooter') {
    coinsEarned = 15
    expEarned = 25
  } else if (gameId === 'arkanoid') {
    coinsEarned = 10
    expEarned = 20
  } else if (gameId === 'klocki') {
    coinsEarned = 15
    expEarned = 25
  } else {
    return { error: 'Nieznana minigra!' }
  }

  const currentLvl = pet.level || 1
  const nextLvlThreshold = getXPForLevel(currentLvl)
  let newTotalExp = (pet.points_earned || 0) + expEarned
  let newLvl = currentLvl
  let leveledUp = false

  if (newTotalExp >= nextLvlThreshold) {
    leveledUp = true
    newLvl += 1
    newTotalExp -= nextLvlThreshold
    coinsEarned += 100 // Mały bonus za Level Up
  }

  const updates: any = {
    urwis_coins: Math.floor((pet.urwis_coins || 0) + coinsEarned),
    points_earned: Math.floor(newTotalExp),
    level: Math.floor(newLvl)
  }

  // --- ACHIEVEMENT CHECK ---
  const currentPetStateForAchievements = {
    ...pet,
    level: updates.level,
    urwis_coins: updates.urwis_coins
  };
  const { newUnlocks, pointsGained } = checkAchievements(currentPetStateForAchievements, 'arcade');
  if (newUnlocks.length > 0) {
     updates.achievements = [...(pet.achievements || []), ...newUnlocks];
     updates.achievement_points = (pet.achievement_points || 0) + pointsGained;
  }

  // --- QUEST PROGRESS ---
  const qProgress = pet.quest_progress || {};
  updates.quest_progress = { ...qProgress, 'q_arcade_2': (qProgress['q_arcade_2'] || 0) + 1 };

  const { error } = await supabase.from('urwis_pet').update(updates).eq('user_id', user.id)
  if (error) return { error: 'Błąd podczas zapisu wygranej z Arcade.' }

  revalidatePath('/strefa-zabawy/urwisek')
  return { success: true, reward: { coins: coinsEarned, exp: expEarned }, leveledUp, newLvl: updates.level, newExp: updates.points_earned, newAchievements: newUnlocks, questProgress: updates.quest_progress }
}

export async function claimQuestReward(questId: string, rewardCoins: number) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Błąd konfiguracji.' }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany!' }

  const { data: pet } = await supabase.from('urwis_pet')
    .select('urwis_coins, completed_quests, achievements, achievement_points, level')
    .eq('user_id', user.id).single()

  if (!pet) return { error: 'Nie znaleziono maskotki.' }

  // Sprawdzanie czy już nie odebrano tego questa dzisiaj/w ogóle (zalezy od logiki docelowej bazy)
  const completedArray = pet.completed_quests || []
  if (completedArray.includes(questId)) {
     return { error: 'Nagroda została już odebrana!' }
  }

  const updates: any = {
    urwis_coins: Math.floor((pet.urwis_coins || 0) + rewardCoins),
    // Zapiszmy id zadania jako ukończone w nowej kolumnie tekstowej jsonb
    completed_quests: [...completedArray, questId] 
  }

  // --- ACHIEVEMENT CHECK ---
  const currentPetStateForAchievements = {
    ...pet,
    urwis_coins: updates.urwis_coins
  };
  const { newUnlocks, pointsGained } = checkAchievements(currentPetStateForAchievements, 'quest');
  if (newUnlocks.length > 0) {
     updates.achievements = [...(pet.achievements || []), ...newUnlocks];
     updates.achievement_points = (pet.achievement_points || 0) + pointsGained;
  }

  const { error } = await supabase.from('urwis_pet').update(updates).eq('user_id', user.id)
  if (error) return { error: 'Błąd odbierania nagrody.' }

  revalidatePath('/strefa-zabawy/urwisek')
  return { success: true, rewardCoins, newAchievements: newUnlocks }
}

// ==========================================
// SYSTEM RANKINGOWY KLOCKÓW
// ==========================================

export async function submitKlockiScore(playerName: string, score: number) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: false }
    const { error } = await supabase
      .from('klocki_scores')
      .insert({
        player_name: playerName,
        score: score
      })
      
    if (error) {
       console.error('Failed to submit klocki score', error)
       return { success: false }
    }
    
    // Inwaliduj cache gdy uaktualniono wynik
    revalidatePath('/strefa-zabawy/klocki');
    return { success: true }
  } catch(e) {
    console.error(e)
    return { success: false }
  }
}

export async function getKlockiRanking(currentScore?: number) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: true, topScores: [] }
    
    const { data: topPlayers, error } = await supabase
      .from('klocki_scores')
      .select('id, player_name, score, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (error || !topPlayers) {
       return { success: true, topScores: [] }
    }
    
    let statsMessage = null;
    
    if (currentScore !== undefined && topPlayers.length > 0) {
        let position = topPlayers.findIndex((p: { score: number }) => p.score <= currentScore!) + 1;
        if (position === 0) position = 11; 
        
        const top3ScoreThreshold = topPlayers.length >= 3 ? topPlayers[2].score : (topPlayers[topPlayers.length-1]?.score || 0);

        if (position <= 3) {
            statsMessage = `Brawo! Wbiłeś na podium Klocków - ${position} Miejsce!`;
        } else {
            const diff = top3ScoreThreshold - currentScore;
            statsMessage = diff > 0 
               ? `Do Top 3 Klocków zabrakło Ci ${diff} punktów!`
               : `Jesteś poza dziesiątką, potrenuj jeszcze!`;
        }
    }

    return { 
       success: true, 
       topScores: topPlayers,
       statsMessage 
    }

  } catch (error) {
    return { success: false, topScores: [] }
  }
}