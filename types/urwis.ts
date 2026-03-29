import { SupabaseClient } from '@supabase/supabase-js';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
}

export interface UrwisPet {
  id: string;
  user_id: string;
  name: string;
  player_name: string;
  gender: 'boy' | 'girl';
  hunger_level: number;
  hygiene_level: number;
  happiness_level: number;
  energy_level: number;
  level: number;
  points_earned: number;
  urwis_coins: number;
  golden_urwis: number;
  last_interaction: string;
  last_fed_at?: string;
  last_washed_at?: string;
  last_played_at?: string;
  last_login_at?: string;
  achievements: string[];
  achievement_points: number;
  inventory?: string[];
  equipped_items?: Record<string, string>;
  quest_progress?: Record<string, number>;
}

export interface InteractionResult {
  success: boolean;
  leveledUp: boolean;
  reward: {
    coins: number;
    exp: number;
    isDailyBonus: boolean;
  };
  newAchievements: string[];
  newState: Partial<UrwisPet>;
}

/**
 * Represents a single entry in a game's leaderboard.
 */
export interface RankingItem {
  id: string;
  player_name: string;
  score: number;
  level?: number;
  created_at: string;
}

/**
 * Response structure for ranking data actions.
 */
export interface RankingResponse {
  success: boolean;
  topScores: RankingItem[];
  statsMessage?: string | null;
}
