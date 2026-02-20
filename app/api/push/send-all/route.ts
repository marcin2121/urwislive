import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    const { title, message, topic, image } = await req.json();

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error('❌ Błąd: Brak kluczy VAPID.');
      return NextResponse.json({ error: 'Klucze VAPID nie są skonfigurowane.' }, { status: 500 });
    }

    webpush.setVapidDetails(
      'mailto:kontakt@sklep-urwis.pl',
      publicKey,
      privateKey
    );

    const supabase = await createClient();

    // 1. Budowanie zapytania z uwzględnieniem "wszystkie"
    let query = supabase
      .from('push_subscriptions')
      .select('subscription_data, endpoint');

    if (topic && topic !== 'wszystkie') {
      // Szukamy tych z konkretnym tematem LUB tych, którzy chcą wszystko
      query = query.or(`topics.cs.{"${topic}"},topics.cs.{"wszystkie"}`);
    }

    const { data: subs, error: dbError } = await query;

    if (dbError) {
      return NextResponse.json({ error: `Błąd bazy: ${dbError.message}` }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Brak odbiorców' });
    }

    // 2. Przygotowanie linku URL z wyzwalaczem ustawień i UTM
    const targetUrl = `/?settings=open&utm_source=pwa_push&utm_medium=notification&utm_campaign=push_${topic || 'general'}`;

    // 3. Masowa wysyłka
    const notifications = subs.map((sub: any) => 
      webpush.sendNotification(
        sub.subscription_data,
        JSON.stringify({
          title: title,
          body: message,
          icon: '/android-chrome-192x192.png',
          image: image || null, // 🚀 Dodajemy obsługę zdjęcia
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

    // 4. 🚀 ZAPIS DO HISTORII (abyś widział kampanie w panelu)
    await supabase.from('push_history').insert([{
      title: title,
      message: message,
      image_url: image || null,
      topic: topic || 'wszystkie',
      sent_to_count: subs.length
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