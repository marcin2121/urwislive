'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { Heart, Utensils, Droplets, Coins, Trophy, Sparkles, X, WifiOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { interactWithUrwis, claimDailyLogin } from '@/app/actions/tamagotchi'

// --- KONFIGURACJA HITBOXA ---
const MOUTH_HITBOX = { top: '56%', left: '42%', width: '16%', height: '12%' };

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
}

export default function UrwisekDashboard({ initialState }: { initialState: PetState }) {
  const [state, setState] = useState<PetState>(initialState)
  const [isPending, startTransition] = useTransition()
  const [isOnline, setIsOnline] = useState(true)

  // Stany gry
  const [isWashingMode, setIsWashingMode] = useState(false)
  const [washTime, setWashTime] = useState(0)
  const [isScrubbingInMouth, setIsScrubbingInMouth] = useState(false)
  const [showCleanSmile, setShowCleanSmile] = useState(false)
  
  // Powiadomienia
  const [rewardMessage, setRewardMessage] = useState<string | null>(null)
  const [showLoginBonus, setShowLoginBonus] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{show: boolean, lvl: number} | null>(null)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  // 1. Sprawdzanie bonusu za logowanie przy wejściu
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

// PROGRESYWNY DECAY - AKTUALIZACJA CO 1 SEKUNDĘ DLA PŁYNNOŚCI
useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        const getDecayPerSecond = (val: number) => {
          // Faza 1: 100% -> 80% w 15 min (20 pkt / 900 sek)
          if (val > 80) return 0.0222;
          
          // Faza 2: 80% -> 60% w 1 godz (20 pkt / 3600 sek)
          if (val > 60) return 0.0055;
          
          // Faza 3: 60% -> 45% w 2h 45min (15 pkt / 9900 sek)
          if (val > 45) return 0.0015;
          
          // Faza 4: 45% -> 30% w 4 godz (15 pkt / 14400 sek)
          if (val > 30) return 0.0010;
          
          // Faza 5: 30% -> 0% w 24 godz (30 pkt / 86400 sek)
          return 0.00034;
        }

        return {
          ...prev,
          hunger: Math.max(0, prev.hunger - getDecayPerSecond(prev.hunger)),
          hygiene: Math.max(0, prev.hygiene - getDecayPerSecond(prev.hygiene)),
          happiness: Math.max(0, prev.happiness - getDecayPerSecond(prev.happiness))
        };
      });
    }, 1000); // Odświeżanie co sekundę

    return () => clearInterval(timer);
  }, []);

  // 3. Obsługa Mycia (10s szorowania)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWashingMode && isScrubbingInMouth && washTime < 10) {
      interval = setInterval(() => setWashTime(prev => Math.min(10, prev + 0.1)), 100)
    }
    if (washTime >= 10 && isWashingMode) handleAction('wash')
    return () => clearInterval(interval)
  }, [isWashingMode, isScrubbingInMouth, washTime])

  // 4. Funkcja akcji (Karmienie / Mycie / Zabawa)
  const handleAction = (type: 'feed' | 'wash' | 'play') => {
    startTransition(async () => {
      const res = await interactWithUrwis(type)
      if (res.success && res.reward) {
        if (res.newState) setState(prev => ({ ...prev, ...res.newState }))
        
        if (type === 'wash') {
          setShowCleanSmile(true); setIsWashingMode(false); setWashTime(0);
          setTimeout(() => setShowCleanSmile(false), 5000)
        }

        if (res.leveledUp) {
            setLevelUpData({ show: true, lvl: res.newState?.level || state.level + 1 })
            setTimeout(() => setLevelUpData(null), 6000)
        }

        const coinLabel = res.reward.coins >= 0 ? `+${res.reward.coins}` : `${res.reward.coins}`
        const msg = res.reward.isDailyBonus 
            ? `BONUS DNIA! ${coinLabel} 🪙` 
            : `${coinLabel} 🪙 i +${res.reward.exp} XP`;
        
        setRewardMessage(msg)
        setTimeout(() => setRewardMessage(null), 4000)
      } else {
        alert(res.error)
        if (type === 'wash') setIsWashingMode(false)
      }
    })
  }

  const handleCursorMove = (event: any, info: any) => {
    cursorX.set(info.point.x - info.target.getBoundingClientRect().left)
    cursorY.set(info.point.y - info.target.getBoundingClientRect().top)
  }

  // Kalkulacja paska XP
  const nextLvlXP = Math.floor(500 * Math.pow(1.2, state.level - 1));
  const xpPercentage = (state.points_earned / nextLvlXP) * 100;

  return (
    <div className="max-w-md mx-auto w-full min-h-[85vh] flex flex-col justify-between p-4 bg-white rounded-[40px] shadow-2xl border-4 border-[#0055ff]/10 relative overflow-hidden">
      
      {/* MODAL LEVEL UP */}
      <AnimatePresence>
        {levelUpData?.show && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0055ff]/40 backdrop-blur-md">
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center border-8 border-yellow-400 m-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                <h2 className="text-3xl font-black text-gray-900 uppercase">Nowy Poziom!</h2>
                <p className="text-5xl font-black text-[#0055ff] my-2">{levelUpData.lvl}</p>
                <div className="flex gap-2 justify-center mt-4">
                   <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black">+5 🏆</span>
                   <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">+100 🪙</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAGŁÓWEK I XP */}
      <div className="space-y-4 z-10 relative">
        <div className="bg-gray-50/80 p-3 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{state.playerName}</p>
              <h2 className="text-xl font-black text-gray-800 leading-none">{state.petName} <span className="text-[#bf2024]">Lvl {state.level}</span></h2>
            </div>
            <div className="flex gap-1">
              <div className="flex items-center gap-1 bg-[#bf2024] text-white px-2 py-1 rounded-full text-[10px] font-black shadow-sm">
                <Trophy className="w-3 h-3" /> {state.goldenUrwis}
              </div>
              <div className="flex items-center gap-1 bg-white border-2 border-[#0055ff] text-[#0055ff] px-2 py-1 rounded-full text-[10px] font-black shadow-sm">
                <Coins className="w-3 h-3" /> {Math.floor(state.urwisCoins)}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 px-1">
               <span>Doświadczenie</span>
               <span>{Math.round(state.points_earned)} / {nextLvlXP} XP</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
               <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" animate={{ width: `${xpPercentage}%` }} />
            </div>
          </div>
        </div>

        <Card className="p-4 bg-white border-2 border-gray-100 shadow-md rounded-2xl space-y-3">
          <StatBar icon={Utensils} label="Głód" value={state.hunger} color="bg-[#bf2024]" />
          <StatBar icon={Droplets} label="Higiena" value={state.hygiene} color="bg-[#0055ff]" />
          <StatBar icon={Heart} label="Radość" value={state.happiness} color="bg-pink-500" />
        </Card>
      </div>

      {/* URWISEK */}
      <div className="flex-1 flex items-center justify-center relative mt-4 mb-4">
        <AnimatePresence>
          {rewardMessage && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-0 z-50 bg-[#0055ff] text-white px-4 py-2 rounded-2xl font-black text-xs shadow-xl text-center">
              {rewardMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="relative w-64 h-64 flex items-center justify-center">
          <Image 
            src={showCleanSmile ? "/urwisek/usmiech.webp" : isWashingMode ? "/urwisek/mycie.webp" : "/urwisek/urwisek.webp"} 
            alt="Urwisek" width={256} height={256} className="object-contain drop-shadow-2xl transition-all duration-500" priority
          />

          {isWashingMode && (
            <>
              <div className="absolute z-30 pointer-events-auto cursor-none" style={MOUTH_HITBOX}
                onMouseEnter={() => setIsScrubbingInMouth(true)} onMouseLeave={() => setIsScrubbingInMouth(false)}
                onTouchStart={() => setIsScrubbingInMouth(true)} onTouchEnd={() => setIsScrubbingInMouth(false)}
              />
              <motion.div className="absolute inset-0 z-40" onPan={handleCursorMove} />
              <motion.div style={{ x: cursorX, y: cursorY, position: 'absolute', top: 0, left: 0 }} className="pointer-events-none z-50 -ml-8 -mt-8">
                <span className="text-6xl drop-shadow-xl rotate-12 block">🪥</span>
              </motion.div>
              <div className="absolute top-0 w-full px-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-blue-100 shadow-inner">
                  <motion.div className="h-full bg-[#0055ff]" animate={{ width: `${washTime * 10}%` }} transition={{ ease: "linear" }} />
                </div>
              </div>
            </>
          )}
          {showCleanSmile && <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} className="absolute z-20"><Sparkles className="w-40 h-40 text-yellow-400 opacity-60" /></motion.div>}
        </motion.div>

        {isWashingMode && (
          <button onClick={() => setIsWashingMode(false)} className="absolute bottom-4 right-4 bg-white p-3 rounded-full text-[#bf2024] shadow-md border z-50">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* PANEL AKCJI */}
      <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-3xl shadow-xl border border-gray-100 relative z-10">
        <ActionButton 
          icon={Utensils} label="Karm" 
          active={state.hunger < 80 && state.urwisCoins >= 40} 
          color="text-[#bf2024]" bgColor="bg-[#bf2024]/10" subLabel="-40 🪙"
          onClick={() => handleAction('feed')} 
        />
        <ActionButton 
          icon={Droplets} label="Myj" 
          active={state.hygiene < 80} 
          color="text-[#0055ff]" bgColor="bg-[#0055ff]/10" subLabel="+20 🪙"
          onClick={() => setIsWashingMode(true)}
        />
        <ActionButton 
          icon={Heart} label="Graj" 
          active={state.happiness < 80} 
          color="text-pink-500" bgColor="bg-pink-50" subLabel="+20 🪙"
          onClick={() => handleAction('play')} 
        />
        <ActionButton 
          icon={Trophy} label="Ranking" active={true} 
          color="text-yellow-600" bgColor="bg-yellow-50" subLabel="Wyniki"
          onClick={() => alert("Ranking już wkrótce!")} 
        />
      </div>

      {/* Bonus Logowania Popup */}
      <AnimatePresence>
        {showLoginBonus && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-[110] flex justify-center px-10">
             <div className="bg-gradient-to-r from-yellow-400 to-[#bf2024] text-white p-4 rounded-3xl shadow-2xl text-center border-4 border-white">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Bonus za powrót! 🎁</p>
                <p className="text-xl font-black leading-none">+50 MONET</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  )
}

function StatBar({ icon: Icon, label, value, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
        <span className="flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200/50">
        <motion.div className={cn("h-full", color)} animate={{ width: `${value}%` }} transition={{ type: "spring", bounce: 0 }} />
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, label, active, color, bgColor, onClick, subLabel }: any) {
  return (
    <button onClick={active ? onClick : undefined} className={cn("flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300", active ? "hover:scale-105 active:scale-95" : "opacity-20 grayscale cursor-not-allowed")}>
      <div className={cn("p-3 rounded-xl shadow-sm", active ? bgColor : "bg-gray-100")}>
        <Icon className={cn("w-6 h-6", active ? color : "text-gray-400")} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-700 leading-none mt-1">{label}</span>
      <span className="text-[8px] font-bold text-gray-400">{subLabel}</span>
    </button>
  )
}