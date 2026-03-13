import { createClient } from '@/lib/supabase/server'
import UrwisekAuth from '@/components/UrwisekAuth'
import UrwisekLobby from '@/components/UrwisekLobby' 
import DeviceCheckWrapper from '@/components/DeviceCheckWrapper'
import UrwisekDashboard from '@/components/UrwisekDashboard'
import { calculateDecay } from '@/lib/urwis/engine'
import Link from 'next/link'
import { ArrowLeft, MoveLeft, Sparkles } from 'lucide-react'
import CloseWindowButton from '@/components/CloseWindowButton'

export const metadata = {
  title: 'Wirtualny Urwis | Sklep Urwis',
  description: 'Zaloguj się i opiekuj się swoim wirtualnym zwierzakiem w Sklepie Urwis!',
};

export default async function UrwisekPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pet = null
  if (user) {
    const { data } = await supabase.from('urwis_pet').select('*').eq('user_id', user.id).single()
    
    if (data) {
      const now = Date.now();
      
      let dbDate = data.last_interaction;
      if (dbDate && !dbDate.endsWith('Z') && !dbDate.includes('+')) {
        dbDate += 'Z'; 
      }
      
      const lastUpdate = dbDate ? new Date(dbDate).getTime() : now;
      const secondsPassed = Math.max(0, Math.floor((now - lastUpdate) / 1000));

      pet = {
        ...data,
        hunger_level: Math.round(calculateDecay(data.hunger_level, secondsPassed)),
        hygiene_level: Math.round(calculateDecay(data.hygiene_level, secondsPassed)),
        happiness_level: Math.round(calculateDecay(data.happiness_level, secondsPassed)),
      }
    }
  }

  return (
    <DeviceCheckWrapper>
      <main className="w-full flex justify-center items-start pt-24 pb-12 relative z-10 px-4 min-h-full">
        <div className="w-full max-w-4xl max-md:hidden mb-8 flex items-center justify-between z-20 absolute top-6 left-1/2 -translate-x-1/2 px-4">
          <Link 
            href="/strefa-zabawy" 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0055ff] to-blue-600 text-white rounded-2xl font-black text-xs overflow-hidden transition-all hover:scale-105 shadow-xl uppercase tracking-widest border-2 border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#BF2024] to-[#0055ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
              Wróć do Strefy Zabawy
            </span>
          </Link>
          <CloseWindowButton className="hidden standalone:inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs">
            Wyjdź
          </CloseWindowButton>
        </div>
        
        <div className="w-full max-w-md relative mt-16 max-md:mt-0 flex justify-center">
          
          {!user ? (
            <UrwisekAuth />
          ) : !pet ? (
            <UrwisekLobby />
          ) : (
            <UrwisekDashboard 
              initialState={{
                playerName: pet.player_name,
                petName: pet.name,
                gender: pet.gender,
                level: pet.level,
                hunger: pet.hunger_level,
                happiness: pet.happiness_level,
                hygiene: pet.hygiene_level,
                urwisCoins: pet.urwis_coins,
                goldenUrwis: pet.golden_urwis,
                points_earned: pet.points_earned,
                lastInteraction: pet.last_interaction,
                inventory: pet.inventory || [],
                equippedItems: pet.equipped_items || {},
                completedQuests: pet.completed_quests || [],
                questProgress: pet.quest_progress || {},
                achievements: pet.achievements || [],
                achievementPoints: pet.achievement_points || 0
              }} 
            />
          )}
        </div>
      </main>
    </DeviceCheckWrapper>
  )
}
