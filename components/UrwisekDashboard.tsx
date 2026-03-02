'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, ArrowLeft, Coins, Star } from 'lucide-react' 
import Link from 'next/link'

// Importy komponentów modułowych
import StatsSection from './urwisek/StatsSection'
import ActionPanel from './urwisek/ActionPanel'
import UrwisShop from './urwisek/UrwisShop'
import ArcadeCenter from './urwisek/ArcadeCenter'
import QuestsPanel from './urwisek/QuestsPanel'
import AchievementsPanel from './urwisek/AchievementsPanel'
import PetDisplay from './urwisek/PetDisplay'
import RankingModal from './urwisek/RankingModal'

// Importy logiki i akcji
import { interactWithUrwis, claimDailyLogin, getUrwisRanking, buyUrwisItem, toggleUrwisItem, finishArcadeGame, claimQuestReward } from '@/app/actions/tamagotchi'
import { calculateDecay } from '@/lib/urwis/engine'
import { SHOP_ITEMS } from '@/lib/urwis/items'
import { cn } from '@/lib/utils'

export interface PetState {
  playerName: string
  petName: string
  gender: string
  level: number
  hunger: number
  happiness: number
  hygiene: number
  urwisCoins: number
  goldenUrwis: number
  points_earned: number
  lastInteraction: string
  inventory: string[]
  equippedItems: Record<string, string>
  completedQuests: string[]
  questProgress: Record<string, number>
  achievements: string[]
  achievementPoints: number
}

export default function UrwisekDashboard({ initialState }: { initialState: PetState }) {
  const [state, setState] = useState<PetState>(() => ({
    ...initialState,
    hunger: Number(initialState.hunger) || 0,
    hygiene: Number(initialState.hygiene) || 0,
    happiness: Number(initialState.happiness) || 0,
    inventory: initialState.inventory || [],
    equippedItems: initialState.equippedItems || {},
  }))
  
  const [isPending, startTransition] = useTransition()
  const [activeMode, setActiveMode] = useState<'none' | 'washing' | 'feeding' | 'playing' | 'ranking' | 'shopping' | 'arcade' | 'quests' | 'achievements'>('none')
  const [rewardMessage, setRewardMessage] = useState<React.ReactNode | null>(null)
  const [showSmile, setShowSmile] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{show: boolean, lvl: number} | null>(null)
  const [showLoginBonus, setShowLoginBonus] = useState(false)
  const [rankingData, setRankingData] = useState<any[]>([])
  const [isRankingOpen, setIsRankingOpen] = useState(false)
  
  const lastTickRef = useRef(Date.now());

  // ✅ FULLSCREEN & HIDE NAVBAR LOGIC
  useEffect(() => {
    document.body.classList.add('game-mode');
    return () => {
      document.body.classList.remove('game-mode');
    }
  }, []);

  // ✅ LOGIKA RANKINGU
  useEffect(() => {
    if (activeMode === 'ranking') {
      const fetchRanking = async () => {
        const res = await getUrwisRanking()
        if (res.success && res.ranking) {
          setRankingData(res.ranking)
          setIsRankingOpen(true)
          setActiveMode('none')
        }
      }
      fetchRanking()
    }
  }, [activeMode])

  // ✅ DECAY LOKALNY
  useEffect(() => {
    const performTick = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      
      if (deltaSeconds >= 1) {
        lastTickRef.current = now;
        setState(prev => ({
          ...prev,
          hunger: calculateDecay(prev.hunger, deltaSeconds),
          hygiene: calculateDecay(prev.hygiene, deltaSeconds),
          happiness: calculateDecay(prev.happiness, deltaSeconds),
        }));
      }
    };

    const timer = setInterval(performTick, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') performTick();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Bonus za logowanie
  useEffect(() => {
    const checkDailyLogin = async () => {
      const res = await claimDailyLogin()
      if (res.success) {
        setShowLoginBonus(true)
        setState(prev => ({ ...prev, urwisCoins: prev.urwisCoins + 50 }))
        setTimeout(() => setShowLoginBonus(false), 5000)
      }
    }
    checkDailyLogin()
  }, [])

  const handleAction = async (type: 'feed' | 'wash' | 'play') => {
    startTransition(async () => {
      const res = await interactWithUrwis(type)
      if (res.success && res.reward) {
        if (res.newState) {
          lastTickRef.current = Date.now();
          setState(prev => ({
            ...prev,
            hunger: res.newState!.hunger ?? prev.hunger,
            hygiene: res.newState!.hygiene ?? prev.hygiene,
            happiness: res.newState!.happiness ?? prev.happiness,
            urwisCoins: res.newState!.urwisCoins,
            level: res.newState!.level,
            points_earned: res.newState!.points_earned,
            goldenUrwis: res.newState!.goldenUrwis,
            lastInteraction: res.newState!.lastInteraction,
            inventory: res.newState!.inventory ?? prev.inventory,
            equippedItems: res.newState!.equippedItems ?? prev.equippedItems,
          }))
        }
        setShowSmile(true)
        const coinLabel = res.reward.coins >= 0 ? `+${res.reward.coins}` : `${res.reward.coins}`
        setRewardMessage(<span className="flex items-center gap-1">{coinLabel} <Coins className="w-4 h-4 text-yellow-500" /> i +{res.reward.exp} EXP</span>)
        setActiveMode('none')
        
        if (res.newAchievements && res.newAchievements.length > 0) {
           setTimeout(() => alert(`🏆 Odblokowano nowe osiągnięcie! (${res.newAchievements.length})`), 500)
        }

        setTimeout(() => {
          setShowSmile(false); setRewardMessage(null); setLevelUpData(null);
        }, 4000)
        if (res.leveledUp) {
          setLevelUpData({ show: true, lvl: res.newState?.level || state.level + 1 })
        }
      } else if (res.error) {
        alert(res.error)
        setActiveMode('none')
      }
    })
  }
  
  // ✅ HANDLER ZAKUPÓW
  const handleBuyItem = async (itemId: string) => {
    const res = await buyUrwisItem(itemId)
    if (res.error) {
      alert(res.error)
      return
    }
    if (res.success && res.updates) {
       setState(prev => ({
         ...prev,
         urwisCoins: res.updates.urwis_coins !== undefined ? res.updates.urwis_coins : prev.urwisCoins,
         hunger: res.updates.hunger_level !== undefined ? res.updates.hunger_level : prev.hunger,
         inventory: res.updates.inventory !== undefined ? res.updates.inventory : prev.inventory,
         achievements: res.updates.achievements !== undefined ? res.updates.achievements : prev.achievements,
         achievementPoints: res.updates.achievement_points !== undefined ? res.updates.achievement_points : prev.achievementPoints,
         questProgress: res.updates.quest_progress !== undefined ? res.updates.quest_progress : prev.questProgress
       }))
       
       if (res.newAchievements && res.newAchievements.length > 0) {
          setTimeout(() => alert(`🏆 Odblokowano nowe osiągnięcie! (${res.newAchievements.length})`), 500)
       }

       setRewardMessage(<span className="flex items-center gap-1">Kupiono! (-{SHOP_ITEMS.find(i => i.id === itemId)?.price} <Coins className="w-4 h-4 text-yellow-500" />)</span>)
       setTimeout(() => setRewardMessage(null), 3000)
    }
  }

  // ✅ HANDLER UBIERANIA
  const handleEquipToggle = async (itemId: string, category: string) => {
    const res = await toggleUrwisItem(itemId, category)
    if (res.error) {
      alert(res.error)
      return
    }
    
    if (res.success && res.equippedItems) {
       setState(prev => ({
         ...prev,
         equippedItems: res.equippedItems
       }))
    }
  }

  // ✅ HANDLER ODBIERANIA NAGRÓD Z MINIGIER ARCADE
  const handleArcadeWin = async (frontendCoins: number, frontendExp: number) => {
    const res = await finishArcadeGame('memory')
    
    if (res.error) {
      alert(res.error)
      return
    }
    if (res.success && res.reward) {
       setState(prev => ({
         ...prev,
         urwisCoins: prev.urwisCoins + res.reward.coins,
         level: res.newLvl,
         points_earned: res.newExp,
         questProgress: res.questProgress || prev.questProgress
       }))
       
       setRewardMessage(<span className="flex items-center gap-1">Wygrana! +{res.reward.coins} <Coins className="w-4 h-4 text-yellow-500" /> i +{res.reward.exp} EXP</span>)
       setShowSmile(true)
       
       if (res.newAchievements && res.newAchievements.length > 0) {
          setState(prev => ({
             ...prev, 
             achievements: [...prev.achievements, ...res.newAchievements]
          }))
          setTimeout(() => alert(`🏆 Odblokowano nowe osiągnięcie! (${res.newAchievements.length})`), 500)
       }

       setTimeout(() => { setShowSmile(false); setRewardMessage(null); }, 3000)
       
       if (res.leveledUp) {
          setLevelUpData({ show: true, lvl: res.newLvl })
       }
    }
    setActiveMode('none')
  }

  // ✅ HANDLER ODBIERANIA NAGRÓD Z MISJI
  const handleClaimQuest = async (questId: string, customReward: number) => {
    const res = await claimQuestReward(questId, customReward)
    
    if (res.error) {
       alert(res.error)
       return
    }

    if (res.success) {
       setState(prev => ({
         ...prev,
         completedQuests: [...prev.completedQuests, questId],
         urwisCoins: prev.urwisCoins + customReward
       }))
       
       if (res.newAchievements && res.newAchievements.length > 0) {
          setState(prev => ({
             ...prev, 
             achievements: [...prev.achievements, ...res.newAchievements]
          }))
          setTimeout(() => alert(`🏆 Odblokowano nowe osiągnięcie! (${res.newAchievements.length})`), 500)
       }

       setRewardMessage(<span className="flex items-center gap-1">Sukces! Zgarniasz +{customReward} <Coins className="w-4 h-4 text-yellow-500" /></span>)
       setShowSmile(true)
       setTimeout(() => { setShowSmile(false); setRewardMessage(null); }, 3000)
    }
  }

  return (
    <div className="select-none mx-auto w-full flex flex-col justify-between p-6 max-md:pb-8 bg-white relative overflow-y-auto overflow-x-hidden scrollbar-hide
      md:max-w-2xl md:h-[75vh] md:my-4 md:rounded-[50px] md:shadow-2xl md:border-8 md:border-[#0055ff]/10
      max-md:fixed max-md:inset-0 max-md:z-[100] max-md:h-[100dvh]">
      
      {/* 🌟 NOWY HEADER GRY (Górny pasek) */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[150] transition-all duration-500",
        activeMode !== 'none' && "opacity-0 -translate-y-20" // Chowa się podczas gier
      )}>
        {/* Lewa: Powrót */}
        <Link 
          href="/" 
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 hover:scale-110 active:scale-95 transition-all group"
        >
          <ArrowLeft className="w-6 h-6 text-urwis-blue stroke-[3]" />
        </Link>
  
        {/* Prawa: Waluty */}
        <div className="flex gap-2">
          {/* Złote Urwiski (jeśli masz w stanie) */}
          <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-gray-700">{state.goldenUrwis || 0}</span>
          </div>
          
          {/* Monety */}
          <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-black text-gray-700">{Math.floor(state.urwisCoins)}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showLoginBonus && (
          <motion.div key="login-bonus" initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-[110] flex justify-center px-10">
             <div className="bg-gradient-to-r from-yellow-400 to-urwis-red text-white p-4 rounded-3xl shadow-2xl text-center border-4 border-white">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Dzień dobry! 🎁</p>
                <p className="text-xl font-black leading-none">+50 MONET</p>
             </div>
          </motion.div>
        )}

        {levelUpData?.show && (
          <motion.div key="levelup" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 z-[120] flex items-center justify-center bg-urwis-blue/40 backdrop-blur-md">
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center border-8 border-yellow-400 m-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">NOWY POZIOM!</h2>
                <p className="text-6xl font-black text-urwis-blue my-2">{levelUpData.lvl}</p>
             </div>
          </motion.div>
        )}

        {isRankingOpen && (
          <RankingModal 
            key="ranking"
            isOpen={isRankingOpen} 
            onClose={() => setIsRankingOpen(false)} 
            ranking={rankingData} 
          />
        )}
        
        {activeMode === 'shopping' && (
          <UrwisShop 
            coins={state.urwisCoins}
            level={state.level}
            inventory={state.inventory || []}
            equippedItems={state.equippedItems || {}}
            onClose={() => setActiveMode('none')}
            onBuy={handleBuyItem}
            onEquipToggle={handleEquipToggle}
          />
        )}
        
        {activeMode === 'arcade' && (
          <ArcadeCenter 
            onClose={() => setActiveMode('none')}
            onGameComplete={handleArcadeWin}
          />
        )}

        {activeMode === 'achievements' && (
          <AchievementsPanel 
            totalPoints={state.achievementPoints} 
            unlockedIds={state.achievements} 
            onClose={() => setActiveMode('none')} 
          />
        )}
        
        {activeMode === 'quests' && (
          <QuestsPanel 
            completedQuests={state.completedQuests}
            questProgress={state.questProgress}
            onClose={() => setActiveMode('none')}
            onClaim={handleClaimQuest}
          />
        )}
      </AnimatePresence>

      <StatsSection state={state} activeMode={activeMode} />

      <PetDisplay 
        activeMode={activeMode} 
        onActionComplete={handleAction} 
        rewardMessage={rewardMessage} 
        setActiveMode={setActiveMode}
        showSmile={showSmile}
        state={state}
      />
      
      <ActionPanel state={state} activeMode={activeMode} onModeChange={setActiveMode} onAction={handleAction} />
    </div>
  )
}