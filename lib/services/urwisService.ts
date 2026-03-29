import { SupabaseClient } from '@supabase/supabase-js';
import { calculateDecay, getXPForLevel } from '@/lib/urwis/engine';
import { checkAchievements } from '@/lib/urwis/achievements';
import { UrwisAction } from '@/lib/validations/urwis';
import { UrwisPet, InteractionResult } from '@/types/urwis';

export class UrwisService {
  /**
   * Fetches the pet record for a given user.
   */
  static async getPet(supabase: SupabaseClient, userId: string): Promise<UrwisPet> {
    const { data: pet, error } = await supabase
      .from('urwis_pet')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !pet) throw new Error('Nie znaleziono Urwiska.');
    return pet as UrwisPet;
  }

  /**
   * Processes a pet interaction (feed, wash, play, etc.)
   */
  static async processInteraction(
    supabase: SupabaseClient, 
    userId: string, 
    pet: UrwisPet, 
    actionType: UrwisAction
  ): Promise<InteractionResult> {
    const now = new Date();
    
    // 1. BEZPIECZNE OBLICZANIE CZASU
    const lastUpdate = pet.last_interaction ? new Date(pet.last_interaction).getTime() : now.getTime();
    const secondsPassed = Math.floor((now.getTime() - lastUpdate) / 1000);

    // 2. PRZELICZENIE STANU (CATCH-UP)
    const currentHunger = calculateDecay(pet.hunger_level, secondsPassed);
    const currentHygiene = calculateDecay(pet.hygiene_level, secondsPassed);
    const currentHappiness = calculateDecay(pet.happiness_level, secondsPassed);

    // 3. BLOKADA 80%
    const statToUpgrade = actionType === 'feed' ? currentHunger : (actionType === 'wash' ? currentHygiene : currentHappiness);
    if (statToUpgrade >= 80 && !['wash_all', 'heal', 'sleep'].includes(actionType)) {
       throw new Error('Urwis nie potrzebuje tego teraz!');
    }

    // 4. EKONOMIA I XP
    const dateField = actionType === 'feed' ? 'last_fed_at' : (actionType === 'wash' ? 'last_washed_at' : 'last_played_at');
    const lastActionDate = pet[dateField] ? new Date(pet[dateField]!) : new Date(0);
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
      if (pet.urwis_coins < 40) throw new Error('Masz za mało monet (potrzeba 40)!');
    } else if (['play', 'wash'].includes(actionType)) {
      coinDelta = 20;
      if (isFirstThisActionToday) coinDelta += 20;
    }

    // 5. LEVEL UP
    let newTotalExp = pet.points_earned + expToAdd;
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

    // 6. ZAPIS DO BAZY
    const updates: Partial<UrwisPet> = {
      urwis_coins: Math.floor(Math.max(0, pet.urwis_coins + coinDelta)),
      golden_urwis: Math.floor(pet.golden_urwis + goldenUrwisAdd),
      points_earned: Math.floor(newTotalExp),
      level: Math.floor(newLvl),
      last_interaction: now.toISOString(),
      [dateField]: now.toISOString(),
      hunger_level: Math.round(actionType === 'feed' ? Math.min(100, currentHunger + 20) : currentHunger),
      hygiene_level: Math.round(actionType === 'wash' ? Math.min(100, currentHygiene + 20) : currentHygiene),
      happiness_level: Math.round(actionType === 'play' ? Math.min(100, currentHappiness + 20) : currentHappiness),
    };

    // --- ACHIEVEMENT CHECK ---
    const { newUnlocks, pointsGained } = checkAchievements({
      ...pet,
      level: Math.floor(newLvl),
      urwis_coins: updates.urwis_coins
    }, actionType);

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

    const { error: updateError } = await supabase
      .from('urwis_pet')
      .update(updates)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return { 
      success: true, 
      leveledUp,
      reward: { coins: coinDelta, exp: expToAdd, isDailyBonus: isFirstThisActionToday },
      newAchievements: newUnlocks,
      newState: updates
    };
  }
}
