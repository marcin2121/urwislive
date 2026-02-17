// ===== CENTRALNA KONFIGURACJA CAŁEJ GAMIFIKACJI =====

export interface Mission {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'daily' | 'weekly';
    requirement: number;
    progress?: number; // ← DODAJ
    reward: {
      points: number;
      exp: number;
    };
    verifyType: 'auto' | 'manual';
    trackingKey?: string;
    // Funkcja niestandardowego obliczania (opcjonalna)
    customProgressFn?: (userId: string) => number;
  }
  
  export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'exploration' | 'games' | 'loyalty' | 'social' | 'special';
    requirement: number;
    reward: {
      points: number;
      exp: number;
      badge?: string;
    };
    trackingKey: string;
    hidden?: boolean; // sekretne osiągnięcia
    customCheckFn?: (userId: string) => boolean;
  }
  
  export interface Challenge {
    id: string;
    type: 'quiz' | 'trivia' | 'math' | 'memory' | 'riddle';
    difficulty: 'easy' | 'medium' | 'hard';
    reward: number;
    expReward: number;
    // Dane specyficzne dla typu
    question?: string;
    answers?: string[];
    correctAnswer?: number;
    task?: string;
    verifyAnswer?: (answer: any) => boolean;
  }
  
  // ===== MISJE =====
  export const MISSIONS: Mission[] = [
    // DAILY
    {
      id: 'daily_visit_home',
      title: 'Odwiedź stronę główną',
      description: 'Wejdź na stronę główną sklepu',
      icon: '🏠',
      type: 'daily',
      requirement: 1,
      reward: { points: 10, exp: 20 },
      verifyType: 'auto',
      trackingKey: 'visit_home'
    },
    {
      id: 'daily_visit_3_pages',
      title: 'Zwiedzacz',
      description: 'Odwiedź 3 różne strony',
      icon: '🗺️',
      type: 'daily',
      requirement: 3,
      reward: { points: 20, exp: 40 },
      verifyType: 'auto',
      trackingKey: 'pages_visited'
    },
    {
      id: 'daily_play_game',
      title: 'Gracz',
      description: 'Zagraj w dowolną grę',
      icon: '🎮',
      type: 'daily',
      requirement: 1,
      reward: { points: 30, exp: 60 },
      verifyType: 'auto',
      trackingKey: 'games_played'
    },
    {
      id: 'daily_spend_5min',
      title: 'Bywalec',
      description: 'Spędź 5 minut na stronie',
      icon: '⏰',
      type: 'daily',
      requirement: 300,
      reward: { points: 25, exp: 50 },
      verifyType: 'auto',
      trackingKey: 'time_spent'
    },
    {
      id: 'daily_check_products',
      title: 'Eksplorator',
      description: 'Sprawdź 5 produktów',
      icon: '🔍',
      type: 'daily',
      requirement: 5,
      reward: { points: 15, exp: 30 },
      verifyType: 'auto',
      trackingKey: 'products_viewed'
    },
  
    // WEEKLY
    {
      id: 'weekly_visit_7_days',
      title: 'Wierny Klient',
      description: 'Odwiedź nas 7 dni z rzędu',
      icon: '🔥',
      type: 'weekly',
      requirement: 7,
      reward: { points: 100, exp: 200 },
      verifyType: 'auto',
      trackingKey: 'streak'
    },
    {
      id: 'weekly_complete_5_challenges',
      title: 'Mistrz Wyzwań',
      description: 'Ukończ 5 dziennych wyzwań',
      icon: '🏆',
      type: 'weekly',
      requirement: 5,
      reward: { points: 150, exp: 300 },
      verifyType: 'auto',
      trackingKey: 'challenges_completed'
    },
    {
      id: 'weekly_play_5_games',
      title: 'Game Master',
      description: 'Zagraj w 5 różnych gier',
      icon: '🎯',
      type: 'weekly',
      requirement: 5,
      reward: { points: 120, exp: 240 },
      verifyType: 'auto',
      trackingKey: 'games_played'
    },
    {
      id: 'weekly_earn_500_points',
      title: 'Kolekcjoner',
      description: 'Zdobądź 500 punktów w tym tygodniu',
      icon: '💎',
      type: 'weekly',
      requirement: 500,
      reward: { points: 200, exp: 400 },
      verifyType: 'auto',
      trackingKey: 'weekly_points'
    },
    {
      id: 'weekly_find_urwis_3',
      title: 'Łowca Urwisa',
      description: 'Znajdź Urwisa 3 razy w tym tygodniu',
      icon: '🧸',
      type: 'weekly',
      requirement: 3,
      reward: { points: 180, exp: 360 },
      verifyType: 'auto',
      trackingKey: 'urwis_found'
    },
  ];
  
  // ===== OSIĄGNIĘCIA =====
  export const ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_login',
      title: 'Witaj w Urwis!',
      description: 'Zaloguj się po raz pierwszy',
      icon: '👋',
      category: 'special',
      requirement: 1,
      reward: { points: 50, exp: 100 },
      trackingKey: 'logins'
    },
    {
      id: 'points_100',
      title: 'Pierwsza Setka',
      description: 'Zdobądź 100 punktów',
      icon: '💯',
      category: 'loyalty',
      requirement: 100,
      reward: { points: 25, exp: 50, badge: 'first_100' },
      trackingKey: 'total_points'
    },
    {
      id: 'points_500',
      title: 'Kolekcjoner',
      description: 'Zdobądź 500 punktów',
      icon: '💰',
      category: 'loyalty',
      requirement: 500,
      reward: { points: 100, exp: 200, badge: 'collector' },
      trackingKey: 'total_points'
    },
    {
      id: 'points_1000',
      title: 'Mistrz Punktów',
      description: 'Zdobądź 1000 punktów',
      icon: '👑',
      category: 'loyalty',
      requirement: 1000,
      reward: { points: 250, exp: 500, badge: 'master' },
      trackingKey: 'total_points'
    },
    {
      id: 'games_master',
      title: 'Gracz Roku',
      description: 'Zagraj we wszystkie dostępne gry',
      icon: '🏆',
      category: 'games',
      requirement: 5,
      reward: { points: 200, exp: 400 },
      trackingKey: 'unique_games_all_time'
    },
    {
      id: 'streak_7',
      title: 'Tydzień Mocy',
      description: 'Odwiedź nas 7 dni z rzędu',
      icon: '🔥',
      category: 'loyalty',
      requirement: 7,
      reward: { points: 150, exp: 300 },
      trackingKey: 'streak'
    },
    {
      id: 'streak_30',
      title: 'Legenda Streaku',
      description: 'Odwiedź nas 30 dni z rzędu',
      icon: '⚡',
      category: 'loyalty',
      requirement: 30,
      reward: { points: 1000, exp: 2000, badge: 'legend' },
      trackingKey: 'streak'
    },
    {
      id: 'explorer',
      title: 'Odkrywca',
      description: 'Odwiedź 20 różnych stron',
      icon: '🗺️',
      category: 'exploration',
      requirement: 20,
      reward: { points: 100, exp: 200 },
      trackingKey: 'unique_pages_all_time'
    },
    {
      id: 'urwis_hunter',
      title: 'Łowca Urwisa',
      description: 'Znajdź ukrytego Urwisa 10 razy',
      icon: '🧸',
      category: 'special',
      requirement: 10,
      reward: { points: 300, exp: 600, badge: 'urwis_hunter' },
      trackingKey: 'urwis_found_all_time'
    },
    {
      id: 'night_owl',
      title: 'Nocny Marek',
      description: 'Odwiedź sklep o 3:00 w nocy',
      icon: '🦉',
      category: 'special',
      requirement: 1,
      reward: { points: 100, exp: 200 },
      trackingKey: 'night_visit',
      hidden: true,
      customCheckFn: (userId: string) => {
        const hour = new Date().getHours();
        if (hour === 3) {
          localStorage.setItem(`urwis_night_visit_${userId}`, 'true');
          return true;
        }
        return !!localStorage.getItem(`urwis_night_visit_${userId}`);
      }
    },
  ];
  
  // ===== DZIENNE WYZWANIA =====
  export const DAILY_CHALLENGES: Challenge[] = [
    // QUIZ
    {
      id: 'quiz_1',
      type: 'quiz',
      difficulty: 'easy',
      reward: 30,
      expReward: 60,
      question: 'Która planeta jest najbliżej Słońca?',
      answers: ['Wenus', 'Merkury', 'Mars', 'Ziemia'],
      correctAnswer: 1
    },
    {
      id: 'quiz_2',
      type: 'quiz',
      difficulty: 'medium',
      reward: 50,
      expReward: 100,
      question: 'W którym roku началась II wojna światowa?',
      answers: ['1939', '1940', '1941', '1938'],
      correctAnswer: 0
    },
    {
      id: 'quiz_3',
      type: 'quiz',
      difficulty: 'hard',
      reward: 80,
      expReward: 160,
      question: 'Która rzeka jest najdłuższa na świecie?',
      answers: ['Nil', 'Amazonka', 'Jangcy', 'Missisipi'],
      correctAnswer: 1
    },
  
    // MATH
    {
      id: 'math_1',
      type: 'math',
      difficulty: 'easy',
      reward: 30,
      expReward: 60,
      task: 'Oblicz: 15 + 27',
      verifyAnswer: (answer: number) => answer === 42
    },
    {
      id: 'math_2',
      type: 'math',
      difficulty: 'medium',
      reward: 50,
      expReward: 100,
      task: 'Oblicz: 8 × 7',
      verifyAnswer: (answer: number) => answer === 56
    },
    {
      id: 'math_3',
      type: 'math',
      difficulty: 'hard',
      reward: 80,
      expReward: 160,
      task: 'Oblicz: (12 + 8) × 3',
      verifyAnswer: (answer: number) => answer === 60
    },
  
    // TRIVIA
    {
      id: 'trivia_1',
      type: 'trivia',
      difficulty: 'easy',
      reward: 30,
      expReward: 60,
      question: 'Jaka jest stolica Polski?',
      answers: ['Kraków', 'Warszawa', 'Gdańsk', 'Wrocław'],
      correctAnswer: 1
    },
    {
      id: 'trivia_2',
      type: 'trivia',
      difficulty: 'medium',
      reward: 50,
      expReward: 100,
      question: 'Ile kontynentów jest na Ziemi?',
      answers: ['5', '6', '7', '8'],
      correctAnswer: 2
    },
  
    // RIDDLE
    {
      id: 'riddle_1',
      type: 'riddle',
      difficulty: 'medium',
      reward: 50,
      expReward: 100,
      question: 'Co ma kręgosłup, ale nie ma kości?',
      answers: ['Książka', 'Wąż', 'Robak', 'Liść'],
      correctAnswer: 0
    },
  ];
  
  // ===== HELPER FUNCTIONS =====
  
  export const getDailyChallengeForDate = (date: Date = new Date()): Challenge => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[index];
  };
  
  export const getMissionsByType = (type: 'daily' | 'weekly'): Mission[] => {
    return MISSIONS.filter(m => m.type === type);
  };
  
  export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
    return ACHIEVEMENTS.filter(a => a.category === category);
  };
  
  export const getVisibleAchievements = (): Achievement[] => {
    return ACHIEVEMENTS.filter(a => !a.hidden);
  };
  