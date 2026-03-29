import { Achievement, UrwisPet } from '@/types/urwis';

export const URWIS_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_feed', title: 'Pierwszy Posiłek', description: 'Nakarm Urwiska po raz pierwszy.', points: 10 },
  { id: 'first_wash', title: 'Czysty Urwis', description: 'Umyj Urwiska w wannie.', points: 10 },
  { id: 'first_play', title: 'Czas na Zabawę', description: 'Pobaw się z Urwiskiem.', points: 10 },
  { id: 'lvl_5', title: 'Dorastanie', description: 'Osiągnij 5 poziom.', points: 20 },
  { id: 'lvl_10', title: 'Prawdziwy Urwis', description: 'Osiągnij 10 poziom.', points: 50 },
  { id: 'rich', title: 'Bogacz', description: 'Zbierz 1000 monet.', points: 30 },
  { id: 'first_buy', title: 'Zakupoholik', description: 'Kup swój pierwszy przedmiot w sklepie.', points: 20 },
]

export function checkAchievements(petState: Partial<UrwisPet>, actionType?: string) {
  const currentAchievements: string[] = petState.achievements || [];
  const newUnlocks: string[] = [];
  let newPoints = 0;

  URWIS_ACHIEVEMENTS.forEach(ach => {
    if (!currentAchievements.includes(ach.id)) {
      let conditionsMet = false;
      
      switch(ach.id) {
        case 'lvl_5': 
          conditionsMet = (petState.level ?? 0) >= 5; 
          break;
        case 'lvl_10': 
          conditionsMet = (petState.level ?? 0) >= 10; 
          break;
        case 'rich': 
          conditionsMet = (petState.urwis_coins ?? 0) >= 1000; 
          break;
        case 'first_buy': 
          conditionsMet = actionType === 'buy'; 
          break;
        case 'first_feed': 
          conditionsMet = actionType === 'feed'; 
          break;
        case 'first_wash': 
          conditionsMet = actionType === 'wash'; 
          break;
        case 'first_play': 
          conditionsMet = actionType === 'play' || actionType === 'arcade'; 
          break;
      }
      
      if (conditionsMet) {
        newUnlocks.push(ach.id);
        newPoints += ach.points;
      }
    }
  });

  return { newUnlocks, pointsGained: newPoints };
}
