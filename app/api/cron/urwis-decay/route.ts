import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Wymuszamy tryb dynamiczny, aby Next.js nie próbował budować tej trasy statycznie
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 2. Weryfikacja nagłówka (bezpieczeństwo - zapobiega uruchamianiu przez osoby postronne)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 3. PRZENIESIONA INICJALIZACJA: Klient tworzy się dopiero w momencie wywołania funkcji.
  // To rozwiązuje błąd "supabaseKey is required" podczas budowania projektu.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Znajdź wszystkie Urwisy, które nie były karmione od ponad 4 godzin
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    const { data: hungryPets, error } = await supabase
      .from('urwis_pet')
      .select('user_id, name, hunger_level, last_interaction')
      .lt('last_interaction', fourHoursAgo)
      .gt('hunger_level', 0);

    if (error || !hungryPets) throw error;

    let notificationsSent = 0;

    // 2. Przelicz spadek statystyk i zaktualizuj bazę
    for (const pet of hungryPets) {
      const newHunger = Math.max(0, pet.hunger_level - 20);
      
      await supabase
        .from('urwis_pet')
        .update({ hunger_level: newHunger })
        .eq('user_id', pet.user_id);

      // Jeśli głód spadł poniżej 30%, zliczamy powiadomienie
      if (newHunger < 30) {
        // Tu możesz dodać logikę wysyłania Push:
        // await sendPushNotification(pet.user_id, { ... });
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