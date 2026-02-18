'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseLoyalty } from '@/contexts/SupabaseLoyaltyContext';
import { createClient } from '@/lib/supabase/client'; // Upewnij się, że masz ten import

// Typ zgodny z bazą danych
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'beginner' | 'explorer' | 'master' | 'legend' | 'special';
  requirement_type: string;
  requirement_value: number;
  reward_exp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function AchievementsPanel() {
  const { user, profile } = useSupabaseAuth();
  const { addExp } = useSupabaseLoyalty();
  const supabase = createClient();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal states
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<Achievement | null>(null);
  
  // Loading state (ważne dla hydracji!)
  const [loading, setLoading] = useState(true);

  // 1. Pobierz definicje i postęp użytkownika z Supabase
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // A. Pobierz definicje osiągnięć
        const { data: defs, error: defsError } = await supabase
          .from('achievements_definitions')
          .select('*');
          
        if (defsError) throw defsError;

        // B. Pobierz zdobyte osiągnięcia użytkownika
        const { data: userUnlocks, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);

        if (userError) throw userError;

        setAchievements(defs || []);
        
        const unlockedSet = new Set<string>();
        userUnlocks?.forEach((u: any) => unlockedSet.add(u.achievement_id));
        setUnlockedIds(unlockedSet);

      } catch (error) {
        console.error('Błąd pobierania osiągnięć:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // 2. Sprawdzanie warunków (Logic Check)
  // To uruchamia się, gdy zmieni się profil (np. wzrośnie level)
  useEffect(() => {
    if (!user || loading || achievements.length === 0) return;

    const checkProgress = async () => {
      let newUnlock = null;

      for (const achievement of achievements) {
        // Jeśli już zdobyte, pomiń
        if (unlockedIds.has(achievement.id)) continue;

        // Sprawdź postęp (teraz bazujemy na danych z profilu Supabase, a nie localStorage)
        const currentVal = getProgressValue(achievement.requirement_type);
        
        if (currentVal >= achievement.requirement_value) {
          // ODBLOKUJ!
          await unlockAchievement(achievement);
          newUnlock = achievement;
          break; // Odblokowuj po jednym na raz, żeby nie zasypać modalami
        }
      }
    };

    checkProgress();
  }, [profile, loading, achievements]); // Zależności: gdy zmieni się profil (level/punkty)

  // Pomocnicza: Pobiera aktualną wartość dla danego typu wymagania
  const getProgressValue = (type: string): number => {
    if (!profile) return 0;
    
    switch (type) {
      case 'level': return profile.level ?? 0;
      case 'points_earned': return profile.points ?? 0; // Zakładamy, że points to suma zdobytych
      // Tutaj musisz dodać logikę dla 'visits', 'streak' itp. pobierając je z profilu
      // W przyszłości przenieś liczniki wizyt i streaka do tabeli 'profiles' w Supabase!
      default: return 0;
    }
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!user) return;

    // 1. Zapisz w bazie
    const { error } = await supabase
      .from('user_achievements')
      .insert({ user_id: user.id, achievement_id: achievement.id });

    if (!error) {
      // 2. Zaktualizuj stan lokalny
      setUnlockedIds(prev => new Set(prev).add(achievement.id));
      
      // 3. Dodaj EXP
      addExp(achievement.reward_exp, `Osiągnięcie: ${achievement.title}`);
      
      // 4. Pokaż modal
      setJustUnlocked(achievement);
      setShowUnlockModal(true);
    }
  };

  // --- UI RENDER (Bez zmian w wyglądzie, tylko podpięcie danych) ---
  
  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Ładowanie osiągnięć...</div>;

  const categories = [
    { id: 'all', name: 'Wszystkie', icon: '🌟' },
    { id: 'beginner', name: 'Początkujący', icon: '🌱' },
    { id: 'master', name: 'Mistrz', icon: '👑' },
    { id: 'legend', name: 'Legenda', icon: '💎' },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const stats = {
    total: achievements.length,
    unlocked: unlockedIds.size,
    percentage: achievements.length > 0 ? Math.round((unlockedIds.size / achievements.length) * 100) : 0
  };

  const getRarityColor = (rarity: string) => { /* Twój kod kolorów... */ return 'from-blue-400 to-blue-600' }; 
  // (Skopiuj swoje funkcje getRarityColor i getRarityBorder tutaj)

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      {/* Header Statystyk */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-2">Osiągnięcia</h2>
        <div className="max-w-md mx-auto mt-4">
            <div className="flex justify-between text-sm font-bold mb-1">
                <span>Postęp</span>
                <span>{stats.percentage}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percentage}%` }}
                />
            </div>
        </div>
      </div>

      {/* Grid Osiągnięć */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            return (
                <motion.div
                    key={achievement.id}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                        isUnlocked ? 'bg-white border-blue-500 shadow-lg' : 'bg-gray-50 border-gray-200 opacity-70 grayscale'
                    }`}
                >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="font-bold">{achievement.title}</h3>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                    {isUnlocked && <div className="mt-2 text-green-600 text-xs font-bold">✓ Odblokowane</div>}
                </motion.div>
            );
        })}
      </div>

      {/* Modal Odblokowania */}
      <AnimatePresence>
        {showUnlockModal && justUnlocked && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={() => setShowUnlockModal(false)}
            >
                <div className="bg-white rounded-3xl p-8 max-w-sm text-center">
                    <div className="text-6xl mb-4">{justUnlocked.icon}</div>
                    <h2 className="text-2xl font-black mb-2">Osiągnięcie!</h2>
                    <p className="text-lg text-purple-600 font-bold">{justUnlocked.title}</p>
                    <div className="mt-6 font-bold text-yellow-500">+{justUnlocked.reward_exp} EXP</div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}