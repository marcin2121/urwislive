import { createClient } from '@/lib/supabase/server'
import UrwisekAuth from '@/components/UrwisekAuth'
import UrwisekLobby from '@/components/UrwisekLobby' 
import DeviceCheckWrapper from '@/components/DeviceCheckWrapper'
import UrwisekDashboard from '@/components/UrwisekDashboard'
import { calculateDecay } from '@/lib/urwis/engine'
import Link from 'next/link'
import { MoveLeft, Sparkles } from 'lucide-react'
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
          <Link href="/strefa-zabawy" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold uppercase tracking-widest text-xs">
            <MoveLeft size={16} /> Wróć do Strefy Zabawy
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
