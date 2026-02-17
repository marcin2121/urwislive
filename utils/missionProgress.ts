import { Mission } from '@/config/gamification.config';

export const getMissionProgress = (mission: Mission, userId: string): number => {
  if (!userId) return 0;

  // Jeśli jest custom function - użyj jej
  if (mission.customProgressFn) {
    return mission.customProgressFn(userId);
  }

  const today = new Date().toDateString();
  const weekStart = getWeekStart();
  const timeKey = mission.type === 'daily' ? today : weekStart;

  if (!mission.trackingKey) return 0;

  // ===== SPECIAL CASES =====
  
  if (mission.trackingKey === 'streak') {
    return calculateCurrentStreak(userId);
  }

  if (mission.trackingKey === 'challenges_completed') {
    return countWeeklyChallenges(userId);
  }

  if (mission.trackingKey === 'games_played' && mission.type === 'weekly') {
    return countUniqueGames(userId);
  }

  if (mission.trackingKey === 'weekly_points') {
    return getWeeklyPoints(userId);
  }

  if (mission.trackingKey === 'urwis_found' && mission.type === 'weekly') {
    return countWeeklyUrwis(userId);
  }

  // Default
  const trackingData = JSON.parse(
    localStorage.getItem(`urwis_tracking_${userId}_${timeKey}`) || '{}'
  );

  return trackingData[mission.trackingKey] || 0;
};

// Helper functions...
const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toDateString();
};

const calculateCurrentStreak = (userId: string): number => {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toDateString();
    
    const visitKey = `urwis_tracking_${userId}_${dateStr}`;
    const data = localStorage.getItem(visitKey);
    
    if (data) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
};

const countWeeklyChallenges = (userId: string): number => {
  const weekStart = getWeekStart();
  const weekStartDate = new Date(weekStart);
  let count = 0;

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(weekStartDate);
    checkDate.setDate(weekStartDate.getDate() + i);
    const dateStr = checkDate.toDateString();
    
    const completedKey = `urwis_challenge_completed_${userId}_${dateStr}`;
    if (localStorage.getItem(completedKey)) {
      count++;
    }
  }

  return count;
};

const countUniqueGames = (userId: string): number => {
  const weekStart = getWeekStart();
  const weekStartDate = new Date(weekStart);
  const uniqueGames = new Set<string>();

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(weekStartDate);
    checkDate.setDate(weekStartDate.getDate() + i);
    const dateStr = checkDate.toDateString();
    
    const trackingKey = `urwis_tracking_${userId}_${dateStr}`;
    const data = JSON.parse(localStorage.getItem(trackingKey) || '{}');
    
    const gamesList = data.games_played_list || [];
    gamesList.forEach((game: string) => uniqueGames.add(game));
  }

  return uniqueGames.size;
};

const getWeeklyPoints = (userId: string): number => {
  const weekStart = getWeekStart();
  const weekStartDate = new Date(weekStart);
  let totalPoints = 0;

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(weekStartDate);
    checkDate.setDate(weekStartDate.getDate() + i);
    const dateStr = checkDate.toDateString();
    
    const pointsKey = `urwis_points_earned_${userId}_${dateStr}`;
    const points = parseInt(localStorage.getItem(pointsKey) || '0');
    totalPoints += points;
  }

  return totalPoints;
};

const countWeeklyUrwis = (userId: string): number => {
  const weekStart = getWeekStart();
  const weekStartDate = new Date(weekStart);
  let count = 0;

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(weekStartDate);
    checkDate.setDate(weekStartDate.getDate() + i);
    const dateStr = checkDate.toDateString();
    
    const urwisKey = `urwis_hidden_found_${userId}_${dateStr}`;
    if (localStorage.getItem(urwisKey)) {
      count++;
    }
  }

  return count;
};
