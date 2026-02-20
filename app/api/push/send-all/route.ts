import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server'; 

webpush.setVapidDetails(
  'mailto:kontakt@sklep-urwis.pl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { title, message } = await req.json();
  const supabase = await createClient();

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('subscription_data');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs) return NextResponse.json({ success: true, count: 0 });

  const notifications = subs.map((sub: any) => 
    webpush.sendNotification(
      sub.subscription_data,
      JSON.stringify({
        title: title,
        body: message,
        icon: '/android-chrome-192x192.png',
        // 🚀 ZMIANA: Dodajemy tagi UTM, żeby Google Analytics automatycznie śledziło kliknięcia!
        data: { url: '/?utm_source=pwa_push&utm_medium=notification&utm_campaign=sklep_urwis' }
      })
    ).catch(async (err) => {
      // 🚀 ZMIANA: Usuwanie martwych subskrypcji (np. gdy ktoś usunął apkę)
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.log('Usuwanie nieaktywnej subskrypcji z bazy...');
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.subscription_data.endpoint);
      }
    })
  );

  await Promise.all(notifications);

  return NextResponse.json({ success: true, count: subs.length });
}