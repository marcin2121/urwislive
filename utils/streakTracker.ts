export const updateStreak = (userId: string) => {
    if (!userId) return;
  
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
  
    // Sprawdź czy już odwiedził dzisiaj
    const todayVisitKey = `urwis_streak_visit_${userId}_${today}`;
    if (localStorage.getItem(todayVisitKey)) {
      console.log('🔥 Streak already updated today');
      return; // Już odwiedzony dzisiaj
    }
  
    // Oznacz dzisiejszą wizytę
    localStorage.setItem(todayVisitKey, 'true');
  
    // Sprawdź wczorajszą wizytę
    const yesterdayVisitKey = `urwis_streak_visit_${userId}_${yesterdayStr}`;
    const visitedYesterday = localStorage.getItem(yesterdayVisitKey);
  
    // Pobierz aktualny streak
    const streakKey = `urwis_streak_${userId}`;
    let currentStreak = parseInt(localStorage.getItem(streakKey) || '0');
  
    if (visitedYesterday) {
      // Kontynuacja streaku
      currentStreak++;
      console.log('🔥 Streak continued:', currentStreak);
    } else {
      // Reset streaku (nowa seria)
      currentStreak = 1;
      console.log('🔥 Streak reset - new series:', currentStreak);
    }
  
    localStorage.setItem(streakKey, currentStreak.toString());
  
    // Trigger mission check
    window.dispatchEvent(new CustomEvent('missionProgress', {
      detail: { type: 'streak', value: currentStreak }
    }));
  
    return currentStreak;
  };
  