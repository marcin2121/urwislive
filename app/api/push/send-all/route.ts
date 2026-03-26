import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { initWebPush } from '@/lib/push-server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    
    // --- ZABEZPIECZENIE: Weryfikacja tożsamości ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'admin@sklep-urwis.pl') {
      console.error('❌ Nieautoryzowana próba wysłania masowego Pusha!');
      return NextResponse.json({ error: 'Brak dostępu' }, { status: 403 });
    }
    // ----------------------------------------------

    // 1. Bezpieczna inicjalizacja Web Push
    const isPushReady = initWebPush();
    if (!isPushReady) {
      return NextResponse.json({ error: 'Push service not configured' }, { status: 503 });
    }

    const { title, message, topic, image } = await req.json();

    // 2. Budowanie zapytania z uwzględnieniem "wszystkie"
    let query = supabase
      .from('push_subscriptions')
      .select('subscription_data, endpoint');

    if (topic && topic !== 'wszystkie') {
      // Szukamy tych z konkretnym tematem LUB tych, którzy chcą wszystko
      const filterStr = 'topics.cs.{"' + topic + '"},topics.cs.{"wszystkie"}';
      query = query.or(filterStr);
    }

    const { data: subs, error: dbError } = await query;

    if (dbError) {
      return NextResponse.json({ error: `Błąd bazy: ${dbError.message}` }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Brak odbiorców' });
    }

    // 3. Przygotowanie linku URL z wyzwalaczem ustawień i UTM
    const targetUrl = `/?settings=open&utm_source=pwa_push&utm_medium=notification&utm_campaign=push_${topic || 'general'}`;

    // 4. Masowa wysyłka
    const notifications = subs.map((sub: any) => 
      webpush.sendNotification(
        sub.subscription_data,
        JSON.stringify({
          title: title,
          body: message,
          icon: '/android-chrome-192x192.png',
          image: image || null,
          badge: '/badge-icon.png',
          data: { url: targetUrl }
        })
      ).catch(async (err) => {
        // Usuwanie wygasłych tokenów (status 404/410)
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[CLEANUP] Usuwanie urządzenia: ${sub.endpoint}`);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
      })
    );

    await Promise.all(notifications);

    // 5. Zapis do historii
    await supabase.from('push_history').insert([{
      title: title,
      message: message,
      image_url: image || null,
      topic: topic || 'wszystkie',
      sent_to_count: subs.length,
      status: 'sent'
    }]);

    return NextResponse.json({ 
      success: true, 
      count: subs.length,
      category: topic || 'wszystkie'
    });

  } catch (error: any) {
    console.error('❌ Krytyczny błąd Push API:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}