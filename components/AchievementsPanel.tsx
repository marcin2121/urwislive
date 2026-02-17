'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseLoyalty } from '@/contexts/SupabaseLoyaltyContext';

// ... (Interface Achievement pozostaje bez zmian) ...
// Wklej tutaj interfejs Achievement z Twojego kodu

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'beginner' | 'explorer' | 'master' | 'legend' | 'special';
  requirement: {
    type: string;
    value: number;
  };
  reward: {
    exp: number;
    badge?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function AchievementsPanel() {
  const { user, profile } = useSupabaseAuth();
  const { addExp } = useSupabaseLoyalty();
  
  // FIX HYDRATION 1: Stan mounted
  const [mounted, setMounted] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  // FIX HYDRATION 2: Ustawienie mounted po renderze
  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: 'all', name: 'Wszystkie', icon: '🌟' },
    // ... reszta kategorii
    { id: 'beginner', name: 'Początkujący', icon: '🌱' },
    { id: 'explorer', name: 'Odkrywca', icon: '🗺️' },
    { id: 'master', name: 'Mistrz', icon: '👑' },
    { id: 'legend', name: 'Legenda', icon: '💎' },
    { id: 'special', name: 'Specjalne', icon: '✨' },
  ];

  // ... (allAchievements pozostaje bez zmian - skracam dla czytelności) ...
  const allAchievements: Achievement[] = [ /* ... Twoja lista ... */ 
    // Tutaj wklej swoją długą tablicę allAchievements
    {
      id: 'first_visit',
      title: 'Pierwsza Wizyta',
      description: 'Odwiedź stronę pierwszy raz',
      icon: '👋',
      category: 'beginner',
      requirement: { type: 'visits', value: 1 },
      reward: { exp: 50 },
      rarity: 'common'
    },
    // ... reszta ...
  ];

  useEffect(() => {
    if (!user) return;

    const filtered = selectedCategory === 'all'
      ? allAchievements
      : allAchievements.filter(a => a.category === selectedCategory);

    setAchievements(filtered);

    const unlocked = new Set<string>();
    // localStorage jest bezpieczne tutaj, bo useEffect działa tylko na kliencie
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`urwis_achievement_${user.id}_`)) {
        const achievementId = key.replace(`urwis_achievement_${user.id}_`, '');
        unlocked.add(achievementId);
      }
    });
    setUnlockedAchievements(unlocked);

    checkAchievements(filtered, unlocked);

  }, [user, selectedCategory]);

  // ... (checkAchievements bez zmian) ...
  const checkAchievements = (achievementsToCheck: Achievement[], unlocked: Set<string>) => {
    if (!user) return;
    achievementsToCheck.forEach(achievement => {
      if (unlocked.has(achievement.id)) return;
      const progress = getAchievementProgress(achievement);
      if (progress >= achievement.requirement.value) {
        unlockAchievement(achievement);
      }
    });
  };

  const getAchievementProgress = (achievement: Achievement): number => {
    // FIX TS: profile może być null, a level undefined. Zwracamy 0 jeśli brak danych.
    if (!user || !profile) return 0;

    const { type } = achievement.requirement;

    // FIX HYDRATION 3: Jeśli ta funkcja jest wołana przed zamontowaniem, 
    // nie możemy dotykać localStorage (zwracamy 0).
    if (typeof window === 'undefined') return 0;

    switch (type) {
      case 'level':
        // FIX TS: Używamy ?? 0, aby obsłużyć undefined
        return profile.level ?? 0;

      case 'total_points':
        return parseInt(localStorage.getItem(`urwis_total_points_${user.id}`) || '0');

      case 'missions_completed':
        let missionCount = 0;
        Object.keys(localStorage).forEach(key => {
          if (key.includes(`urwis_mission_`) && key.includes(`_${user.id}_`)) {
            missionCount++;
          }
        });
        return missionCount;

      case 'urwis_found':
        let urwisCount = 0;
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`urwis_hidden_found_${user.id}_`)) {
            urwisCount++;
          }
        });
        return urwisCount;

      case 'streak':
        return parseInt(localStorage.getItem(`urwis_streak_${user.id}`) || '0');

      case 'games_played':
        return parseInt(localStorage.getItem(`urwis_games_played_${user.id}`) || '0');

      case 'unique_pages':
        const allVisitedPages = new Set();
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`urwis_pages_visited_${user.id}_`)) {
            const pages = JSON.parse(localStorage.getItem(key) || '[]');
            pages.forEach((p: string) => allVisitedPages.add(p));
          }
        });
        return allVisitedPages.size;

      case 'visits':
        return parseInt(localStorage.getItem(`urwis_total_visits_${user.id}`) || '0');

      case 'points_earned':
        return parseInt(localStorage.getItem(`urwis_points_earned_${user.id}`) || '0');

      case 'early_visit':
        const hour = new Date().getHours();
        return hour < 6 ? 1 : 0;

      case 'night_visit':
        const nightHour = new Date().getHours();
        return nightHour >= 0 && nightHour < 4 ? 1 : 0;

      default:
        return 0;
    }
  };

  // ... (unlockAchievement, getRarityColor, getRarityBorder bez zmian) ...
  const unlockAchievement = (achievement: Achievement) => {
    if (!user) return;
    localStorage.setItem(`urwis_achievement_${user.id}_${achievement.id}`, 'true');
    setUnlockedAchievements(prev => new Set([...prev, achievement.id]));
    addExp(achievement.reward.exp, `Achievement: ${achievement.id}`);
    setUnlockedAchievement(achievement);
    setShowUnlockModal(true);
  };

  const getRarityColor = (rarity: string) => { /* ... */ switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    } };
  const getRarityBorder = (rarity: string) => { /* ... */ switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-300';
    }};

  const stats = {
    total: allAchievements.length,
    unlocked: unlockedAchievements.size,
    percentage: Math.round((unlockedAchievements.size / allAchievements.length) * 100)
  };

  // FIX HYDRATION 4: Jeśli nie zamontowano, nie renderujemy nic (lub szkielet)
  // zapobiega to błędowi mismatch, bo localStorage nie istnieje na serwerze
  if (!mounted) return null; 

  return (
    <>
      <div className="bg-white rounded-3xl shadow-2xl p-8">
         {/* ... Reszta JSX bez zmian ... */}
         {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-black mb-2">Osiągnięcia</h2>
          <p className="text-gray-600 mb-6">Zdobywaj osiągnięcia i odblokowuj nagrody EXP!</p>

          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">
                {stats.unlocked} / {stats.total}
              </span>
              <span className="text-sm font-bold text-purple-600">
                {stats.percentage}% ukończone
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${selectedCategory === category.id
                ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.icon} {category.name}
            </motion.button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const isUnlocked = unlockedAchievements.has(achievement.id);
            const progress = getAchievementProgress(achievement);
            const progressPercent = Math.min((progress / achievement.requirement.value) * 100, 100);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl border-4 transition-all ${isUnlocked
                  ? `bg-linear-to-br ${getRarityColor(achievement.rarity)} ${getRarityBorder(achievement.rarity)} shadow-xl`
                  : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
              >
                <div className="text-center">
                  <div
                    className={`text-5xl mb-3 ${!isUnlocked && 'grayscale filter'}`}
                    style={{ filter: isUnlocked ? 'none' : 'grayscale(100%)' }}
                  >
                    {achievement.icon}
                  </div>
                  <h3 className={`text-lg font-black mb-1 ${isUnlocked ? 'text-white' : 'text-gray-900'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-3 ${isUnlocked ? 'text-white/90' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>

                  {/* Progress */}
                  {!isUnlocked && (
                    <div className="mb-3">
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        {progress} / {achievement.requirement.value}
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Reward */}
                  <div className={`text-sm font-bold ${isUnlocked ? 'text-yellow-300' : 'text-purple-600'}`}>
                    +{achievement.reward.exp} EXP
                  </div>

                  {/* Rarity Badge */}
                  <div className={`mt-2 text-xs font-bold uppercase ${isUnlocked ? 'text-white' : 'text-gray-500'
                    }`}>
                    {achievement.rarity === 'common' && '⚪ Pospolite'}
                    {achievement.rarity === 'rare' && '🔵 Rzadkie'}
                    {achievement.rarity === 'epic' && '🟣 Epickie'}
                    {achievement.rarity === 'legendary' && '🟡 Legendarne'}
                  </div>

                  {isUnlocked && (
                    <div className="mt-3 text-white font-bold text-sm">
                      ✓ Odblokowane!
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <div className="text-3xl mb-1">⚪</div>
            <div className="text-lg font-black text-gray-600">
              {allAchievements.filter(a => a.rarity === 'common' && unlockedAchievements.has(a.id)).length}
            </div>
            <div className="text-xs text-gray-500">Pospolite</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <div className="text-3xl mb-1">🔵</div>
            <div className="text-lg font-black text-blue-600">
              {allAchievements.filter(a => a.rarity === 'rare' && unlockedAchievements.has(a.id)).length}
            </div>
            <div className="text-xs text-gray-500">Rzadkie</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <div className="text-3xl mb-1">🟣</div>
            <div className="text-lg font-black text-purple-600">
              {allAchievements.filter(a => a.rarity === 'epic' && unlockedAchievements.has(a.id)).length}
            </div>
            <div className="text-xs text-gray-500">Epickie</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl text-center">
            <div className="text-3xl mb-1">🟡</div>
            <div className="text-lg font-black text-orange-600">
              {allAchievements.filter(a => a.rarity === 'legendary' && unlockedAchievements.has(a.id)).length}
            </div>
            <div className="text-xs text-gray-500">Legendarne</div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && unlockedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUnlockModal(false)}
            className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-linear-to-br ${getRarityColor(unlockedAchievement.rarity)} rounded-3xl p-8 max-w-md text-center shadow-2xl border-4 ${getRarityBorder(unlockedAchievement.rarity)}`}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 1 }}
                className="text-8xl mb-4"
              >
                {unlockedAchievement.icon}
              </motion.div>
              <h3 className="text-4xl font-black text-white mb-2">
                Osiągnięcie Odblokowane!
              </h3>
              <p className="text-2xl font-bold text-white mb-4">
                {unlockedAchievement.title}
              </p>
              <p className="text-white/90 mb-6">
                {unlockedAchievement.description}
              </p>
              <div className="p-4 bg-white/20 rounded-xl mb-6 backdrop-blur-sm">
                <div className="text-3xl font-black text-yellow-300">
                  +{unlockedAchievement.reward.exp} EXP ✨
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUnlockModal(false)}
                className="px-8 py-3 bg-white text-purple-600 rounded-full font-bold shadow-xl"
              >
                Niesamowite! 🎉
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}