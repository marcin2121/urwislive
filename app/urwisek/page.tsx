import { createClient } from '@/lib/supabase/server'
import UrwisekAuth from '@/components/UrwisekAuth'
import UrwisekLobby from '@/components/UrwisekLobby' 
import DeviceCheckWrapper from '@/components/DeviceCheckWrapper'
import UrwisekDashboard from '@/components/UrwisekDashboard'

export const metadata = {
  title: 'Urwisek | Gra PWA - Sklep Urwis Białobrzegi',
  description: 'Opiekuj się Urwiskiem i wymieniaj Złote Urwisy na nagrody na ul. Reymonta 38A.',
}

// Funkcja obliczająca spadek statystyk na serwerze
function calculateServerDecay(val: number, secondsPassed: number) {
  let currentVal = val;
  // Symulujemy spadek sekunda po sekundzie, aby zachować logikę faz
  for (let i = 0; i < secondsPassed; i++) {
    let decay = 0.00034; // Faza 5 (30% -> 0% w 24h)
    if (currentVal > 80) decay = 0.0222;      // 100% -> 80% (15 min)
    else if (currentVal > 60) decay = 0.0055; // 80% -> 60% (1h)
    else if (currentVal > 45) decay = 0.0015; // 60% -> 45% (2h 45m)
    else if (currentVal > 30) decay = 0.0010; // 45% -> 30% (4h)
    
    currentVal = Math.max(0, currentVal - decay);
    // Jeśli spadnie do 0, nie ma sensu liczyć dalej
    if (currentVal <= 0) break;
  }
  return currentVal;
}

export default async function UrwisekPage() {
  const supabase = await createClient()
  
  // 1. Sprawdzamy czy użytkownik ma założone KONTO
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Jeśli ma konto, pobieramy dane jego URWISKA
  let pet = null
  if (user) {
    const { data } = await supabase
      .from('urwis_pet')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      // OBLICZAMY UPŁYW CZASU
      const now = new Date();
      const lastUpdate = new Date(data.last_interaction);
      const secondsPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

      // Nakładamy spadek na statystyki przed wysłaniem ich do przeglądarki
      pet = {
        ...data,
        hunger_level: calculateServerDecay(data.hunger_level, secondsPassed),
        hygiene_level: calculateServerDecay(data.hygiene_level, secondsPassed),
        happiness_level: calculateServerDecay(data.happiness_level, secondsPassed),
      }
    }
  }

  return (
    <DeviceCheckWrapper>
      <main className="min-h-screen relative z-50 flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md relative z-20 text-gray-900">
          
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
                points_earned: pet.points_earned
              }} 
            />
          )}

        </div>
      </main>
    </DeviceCheckWrapper>
  )
}