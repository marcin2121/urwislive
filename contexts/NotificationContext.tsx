'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import MissionNotification from '@/components/MissionNotification';

interface NotificationContextType {
  addNotification: (mission: any) => void;
  checkMissionProgress: (trackingKey: string, value: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (mission: any) => {
    const newNotif = { 
      id: Date.now(), 
      mission,
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotif]);
    
    // Auto-remove po 7 sekundach
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 7000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Sprawdzaj progress misji
  const checkMissionProgress = (trackingKey: string, value: number) => {
    if (!profile) return;

    console.log('🔔 Check Mission Progress:', trackingKey, '=', value); // DEBUG

    // Pobierz wszystkie misje
    const allMissions = [
      {
        id: 'daily_visit_home',
        title: 'Odwiedź stronę główną',
        description: 'Wejdź na stronę główną sklepu',
        icon: '🏠',
        type: 'daily',
        requirement: 1,
        reward: { points: 10, exp: 20 },
        trackingKey: 'visit_home'
      },
      {
        id: 'daily_visit_profile',
        title: 'Sprawdź profil',
        description: 'Wejdź na swoją stronę profilu',
        icon: '👤',
        type: 'daily',
        requirement: 1,
        reward: { points: 15, exp: 30 },
        trackingKey: 'visit_profile'
      },
      {
        id: 'daily_visit_3_pages',
        title: 'Zwiedzacz',
        description: 'Odwiedź 3 różne strony',
        icon: '🗺️',
        type: 'daily',
        requirement: 3,
        reward: { points: 20, exp: 40 },
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
        trackingKey: 'products_viewed'
      },
      {
        id: 'daily_visit_games',
        title: 'Miłośnik gier',
        description: 'Odwiedź sekcję gier',
        icon: '🎮',
        type: 'daily',
        requirement: 1,
        reward: { points: 15, exp: 30 },
        trackingKey: 'visit_games'
      },
    ];

    // Znajdź misje z tym trackingKey
    const relevantMissions = allMissions.filter(m => m.trackingKey === trackingKey);
    
    console.log('🎯 Relevant missions:', relevantMissions.length); // DEBUG

    relevantMissions.forEach(mission => {
      // Sprawdź czy nie jest już ukończona
      const today = new Date().toDateString();
      const completedKey = `urwis_mission_${mission.id}_${profile.id}_${today}`;
      if (localStorage.getItem(completedKey)) {
        console.log('✅ Already completed:', mission.id); // DEBUG
        return;
      }

      // Sprawdź czy nie pokazaliśmy już powiadomienia
      const notifKey = `urwis_mission_notif_${mission.id}_${profile.id}_${today}`;
      if (localStorage.getItem(notifKey)) {
        console.log('🔕 Notification already shown:', mission.id); // DEBUG
        return;
      }

      // Sprawdź czy spełnione
      if (value >= mission.requirement) {
        console.log('🎉 Mission completed! Showing notification:', mission.title); // DEBUG
        addNotification(mission);
        localStorage.setItem(notifKey, 'true');
      } else {
        console.log('⏳ Progress:', value, '/', mission.requirement); // DEBUG
      }
    });
  };

  // ✨ DODAJ TEN useEffect - nasłuchuj custom events
  useEffect(() => {
    if (!profile) return;

    const handleMissionProgress = (event: any) => {
      const { type, value } = event.detail;
      console.log('📨 Custom event received:', type, value); // DEBUG
      checkMissionProgress(type, value);
    };

    window.addEventListener('missionProgress', handleMissionProgress as EventListener);
    
    return () => {
      window.removeEventListener('missionProgress', handleMissionProgress as EventListener);
    };
  }, [profile]); // ← WAŻNE: dependency array

  return (
    <NotificationContext.Provider value={{ addNotification, checkMissionProgress }}>
      {children}
      
      {/* Global notifications - prawy dolny róg */}
      <div className="fixed bottom-4 right-4 z-9999 space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <MissionNotification
              mission={n.mission}
              onClose={() => removeNotification(n.id)}
              onClaim={() => {
                removeNotification(n.id);
                // Redirect do misji
                window.location.href = '/misje';
              }}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
