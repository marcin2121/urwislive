// Funkcje pomocnicze do trackowania misji

export const trackGamePlayed = (userId: string, gameName: string) => {
    if (!userId) return;
    
    const today = new Date().toDateString();
    const trackingKey = `urwis_tracking_${userId}_${today}`;
    const trackingData = JSON.parse(localStorage.getItem(trackingKey) || '{}');
    
    // Track games played
    trackingData.games_played = (trackingData.games_played || 0) + 1;
    
    // Track unique games
    const gamesPlayedList = trackingData.games_played_list || [];
    if (!gamesPlayedList.includes(gameName)) {
      gamesPlayedList.push(gameName);
      trackingData.games_played_list = gamesPlayedList;
    }
    
    localStorage.setItem(trackingKey, JSON.stringify(trackingData));
    
    // Track total games (all time)
    const totalGamesKey = `urwis_games_played_${userId}`;
    const totalGames = parseInt(localStorage.getItem(totalGamesKey) || '0');
    localStorage.setItem(totalGamesKey, (totalGames + 1).toString());
    
    console.log('🎮 Tracking: Gra zagrana:', gameName);
    console.log('🎮 Tracking: Gry dzisiaj:', trackingData.games_played);
    console.log('🎮 Tracking: Gry total:', totalGames + 1);
    
    // Trigger check (używamy custom event)
    window.dispatchEvent(new CustomEvent('missionProgress', {
      detail: { type: 'games_played', value: trackingData.games_played }
    }));
  };
  
  export const trackProductViewed = (userId: string, productId: string) => {
    if (!userId) return;
    
    const today = new Date().toDateString();
    const trackingKey = `urwis_tracking_${userId}_${today}`;
    const trackingData = JSON.parse(localStorage.getItem(trackingKey) || '{}');
    
    const productsViewed = trackingData.products_viewed_list || [];
    if (!productsViewed.includes(productId)) {
      productsViewed.push(productId);
      trackingData.products_viewed_list = productsViewed;
      trackingData.products_viewed = productsViewed.length;
      
      localStorage.setItem(trackingKey, JSON.stringify(trackingData));
      
      console.log('🔍 Tracking: Produkt wyświetlony:', productId);
      console.log('🔍 Tracking: Produkty dzisiaj:', productsViewed.length);
      
      window.dispatchEvent(new CustomEvent('missionProgress', {
        detail: { type: 'products_viewed', value: productsViewed.length }
      }));
    }
  };
  
  export const trackPointsEarned = (userId: string, points: number) => {
    if (!userId) return;
    
    const pointsKey = `urwis_points_earned_${userId}`;
    const totalPoints = parseInt(localStorage.getItem(pointsKey) || '0');
    localStorage.setItem(pointsKey, (totalPoints + points).toString());
    
    const totalPointsKey = `urwis_total_points_${userId}`;
    const allTimePoints = parseInt(localStorage.getItem(totalPointsKey) || '0');
    localStorage.setItem(totalPointsKey, (allTimePoints + points).toString());
    
    console.log('💰 Tracking: Punkty zdobyte:', points);
    console.log('💰 Tracking: Total punktów:', allTimePoints + points);
  };
  