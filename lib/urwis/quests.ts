// Definicje misji - wspólne dla UI i serwera (serwer liczy nagrodę wyłącznie stąd)
export const DAILY_QUESTS = [
  { id: 'q_feed_3', title: 'Wielki Głód', desc: 'Nakarm Urwiska 3 razy', reward: 100, target: 3 },
  { id: 'q_play', title: 'Czas na Zabawę', desc: 'Pobaw się ze zwierzakiem', reward: 50, target: 1 },
  { id: 'q_shop_2', title: 'Mały Kupiec', desc: 'Kup 2 przedmioty w Sklepie', reward: 150, target: 2 },
  { id: 'q_wash_3', title: 'Czysty Urwis', desc: 'Umyj Urwiska 3 razy', reward: 100, target: 3 },
  { id: 'q_arcade_2', title: 'Mistrz Arcade', desc: 'Zagraj 2 razy w minigrę', reward: 120, target: 2 },
] as const;
