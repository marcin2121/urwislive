import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Załóżmy, że masz tu swoją funkcję do wysyłania pushy, np:
// import { sendPushNotification } from '@/lib/push-config'; 

// Używamy Service Role Key, aby mieć dostęp do całej bazy w tle
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Weryfikacja nagłówka, aby nikt z zewnątrz nie odpalał Crona
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Znajdź wszystkie Urwisy, które nie były karmione od ponad 4 godzin
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    const { data: hungryPets, error } = await supabase
      .from('urwis_pet')
      .select('user_id, name, hunger_level, last_interaction')
      .lt('last_interaction', fourHoursAgo)
      .gt('hunger_level', 0); // Pomijamy te, które już mają 0, żeby nie spamować

    if (error || !hungryPets) throw error;

    let notificationsSent = 0;

    // 2. Przelicz spadek statystyk i wyślij powiadomienia
    for (const pet of hungryPets) {
      // Zmniejszamy głód np. o 20 punktów
      const newHunger = Math.max(0, pet.hunger_level - 20);
      
      await supabase
        .from('urwis_pet')
        .update({ hunger_level: newHunger })
        .eq('user_id', pet.user_id);

      // Jeśli głód spadł poniżej 30%, wysyłamy Push!
      if (newHunger < 30) {
        // Tu wywołujesz swoją logikę wysyłania web-push:
        /*
        await sendPushNotification(pet.user_id, {
          title: 'Twój Urwis burczy w brzuchu! 🦖',
          body: 'Wejdź do Akademii Urwisa, nakarm go i zdobywaj punkty na nowe klocki LEGO!',
          icon: '/urwis-icon.webp',
          url: '/akademia'
        });
        */
        notificationsSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: hungryPets.length,
      notificationsSent 
    });

  } catch (error) {
    console.error('Błąd Crona Tamagotchi:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}