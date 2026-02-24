export const URWIS_CONFIG = {
    MAX_STAT: 100,
    ACTION_THRESHOLD: 80,
    
    PRICES: { FEED: 40 },
    REWARDS: {
      WASH: 20,
      PLAY: 20,
      DAILY_LOGIN: 50,
      FIRST_ACTION_BONUS: 20,
      LEVEL_UP_COINS: 100,
      LEVEL_UP_GOLDEN: 5,
    },
  
    LEVELING: {
      BASE_XP: 500,
      EXPONENT: 1.2,
      FIRST_ACTION_XP_MULT: 0.0833, // 8.33% lvla
      BASE_ACTION_XP: 50,
    },
  
    // Przeliczone na sekundy dla płynności
    DECAY_RATES: {
      PHASE_1: 0.0222,  // 100-80 (15 min)
      PHASE_2: 0.0055,  // 80-60 (1h)
      PHASE_3: 0.0015,  // 60-45 (2h 45m)
      PHASE_4: 0.0010,  // 45-30 (4h)
      PHASE_5: 0.00034, // 30-0 (24h)
    }
  };