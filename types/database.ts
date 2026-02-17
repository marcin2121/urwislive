export type UserRole = 'user' | 'admin' | 'moderator';

export interface Profile {
  id: string;
  username: string;
  email: string;
  level: number;
  total_exp: number;
  avatar_url: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface HiddenUrwisFind {
  id: string;
  user_id: string;
  found_date: string;
  created_at: string;
}

export interface LoyaltyPoint {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward_exp: number;
  reward_points: number;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  progress: number;
  max_progress: number;
  completed: boolean;
  claimed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface QuizSession {
  id: string
  user_id: string
  mode: 'single' | 'duel' | 'challenge' | 'party'
  category: string
  questions_count: number
  score: number
  accuracy: number
  max_streak: number
  completed_at: string
}

// Supabase Database schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      hidden_urwis_finds: {
        Row: HiddenUrwisFind;
        Insert: Omit<HiddenUrwisFind, 'id' | 'created_at'>;
        Update: never;
      };
      loyalty_points: {
        Row: LoyaltyPoint;
        Insert: Omit<LoyaltyPoint, 'id' | 'created_at'>;
        Update: never;
      };
      user_streaks: {
        Row: UserStreak;
        Insert: Omit<UserStreak, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserStreak, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      missions: {
        Row: Mission;
        Insert: Omit<Mission, 'id' | 'created_at'>;
        Update: Partial<Omit<Mission, 'id' | 'created_at'>>;
      };
      user_missions: {
        Row: UserMission;
        Insert: Omit<UserMission, 'id' | 'created_at'>;
        Update: Partial<Omit<UserMission, 'id' | 'user_id' | 'mission_id' | 'created_at'>>;
      };
    };
    Functions: {
      get_top_urwis_hunters: {
        Args: { limit_count: number };
        Returns: Array<{
          user_id: string;
          username: string;
          find_count: number;
        }>;
      };
    };
  };
}
