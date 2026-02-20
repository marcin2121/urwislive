import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    const { title, message, topic } = await req.json();

    // 1. Sprawdzenie i bezpieczna inicjalizacja kluczy VAPID
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error('❌ Błąd: Brak kluczy VAPID w Environment Variables.');
      return NextResponse.json({ error: 'Klucze VAPID nie są skonfigurowane.' }, { status: 500 });
    }

    webpush.setVapidDetails(
      'mailto:kontakt@sklep-urwis.pl',
      publicKey,
      privateKey
    );

    const supabase = await createClient();

    // 2. Budowanie zapytania do bazy
    let query = supabase
      .from('push_subscriptions')
      .select('subscription_data, endpoint');

    // Filtrowanie po temacie (jeśli wybrano konkretny)
    if (topic && topic !== 'wszystkie') {
      // WAŻNE: Kolumna 'topics' musi istnieć w bazie jako text[]
      query = query.contains('topics', [topic]);
    }

    const { data: subs, error: dbError } = await query;

    if (dbError) {
      console.error('❌ Błąd bazy danych Supabase:', dbError.message);
      return NextResponse.json({ error: `Błąd bazy: ${dbError.message}` }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Brak odbiorców' });
    }

    // 3. Masowa wysyłka powiadomień
    const notifications = subs.map((sub: any) => 
      webpush.sendNotification(
        sub.subscription_data,
        JSON.stringify({
          title: title,
          body: message,
          icon: '/android-chrome-192x192.png',
          data: { 
            url: `/?utm_source=pwa_push&utm_medium=notification&utm_campaign=push_${topic || 'general'}` 
          }
        })
      ).catch(async (err) => {
        // Automatyczne usuwanie nieaktywnych subskrypcji z bazy (status 404 lub 410)
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[CLEANUP] Usuwanie wygasłego urządzenia: ${sub.endpoint}`);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
      })
    );

    await Promise.all(notifications);

    return NextResponse.json({ 
      success: true, 
      count: subs.length,
      category: topic || 'wszystkie'
    });

  } catch (error: any) {
    console.error('❌ Krytyczny błąd Push API:', error);
    return NextResponse.json({ 
      error: 'Wystąpił błąd serwera podczas wysyłki.',
      details: error.message 
    }, { status: 500 });
  }
}