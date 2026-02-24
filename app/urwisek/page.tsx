import { createClient } from '@/lib/supabase/server'
import UrwisekAuth from '@/components/UrwisekAuth'
import UrwisekLobby from '@/components/UrwisekLobby' 
import DeviceCheckWrapper from '@/components/DeviceCheckWrapper'
import UrwisekDashboard from '@/components/UrwisekDashboard'
import { calculateDecay } from '@/lib/urwis/engine'

export default async function UrwisekPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pet = null
  if (user) {
    const { data } = await supabase.from('urwis_pet').select('*').eq('user_id', user.id).single()
    
    if (data) {
      const now = Date.now();
      const lastUpdate = data.last_interaction ? new Date(data.last_interaction).getTime() : now;
      const secondsPassed = Math.max(0, Math.floor((now - lastUpdate) / 1000));

      // Przeliczamy statystyki raz na serwerze i zaokrąglamy (dla uniknięcia problemów z typem integer)
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
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md relative text-gray-900">
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
                // DODAJ TO POLE:
                lastInteraction: pet.last_interaction 
              }} 
            />
          )}
        </div>
      </main>
    </DeviceCheckWrapper>
  )
}