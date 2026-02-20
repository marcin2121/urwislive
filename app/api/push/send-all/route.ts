import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server'; 

webpush.setVapidDetails(
  'mailto:kontakt@sklep-urwis.pl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  // 🚀 ZMIANA: Przyjmujemy 'topic' z body (np. 'zabawki', 'lecewkulki')
  const { title, message, topic } = await req.json();
  const supabase = await createClient();

  // 🚀 ZMIANA: Budujemy zapytanie z filtrowaniem po temacie
  let query = supabase
    .from('push_subscriptions')
    .select('subscription_data, endpoint');

  // Jeśli wybrano konkretny temat i nie jest to "wszystkie", filtrujemy bazę
  if (topic && topic !== 'wszystkie') {
    // Postgresowy operator .contains dla tablic (text[])
    query = query.contains('topics', [topic]);
  }

  const { data: subs, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs || subs.length === 0) {
    return NextResponse.json({ success: true, count: 0, message: 'Brak subskrybentów w tej kategorii' });
  }

  const notifications = subs.map((sub: any) => 
    webpush.sendNotification(
      sub.subscription_data,
      JSON.stringify({
        title: title,
        body: message,
        icon: '/android-chrome-192x192.png',
        // 🚀 ZMIANA: Dynamiczne UTM - w GA4 zobaczysz, z której kategorii powiadomień przyszli ludzie
        data: { 
          url: `/?utm_source=pwa_push&utm_medium=notification&utm_campaign=push_${topic || 'general'}` 
        }
      })
    ).catch(async (err) => {
      // Jeśli endpoint wygasł (404/410), usuwamy go z bazy
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.log(`[CLEANUP] Usuwanie martwej subskrypcji: ${sub.endpoint}`);
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
}