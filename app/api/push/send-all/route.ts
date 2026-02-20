import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server'; // Klient serwerowy

// Konfiguracja web-push
webpush.setVapidDetails(
  'mailto:kontakt@sklep-urwis.pl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { title, message } = await req.json();
  
  // ROZWIĄZANIE BŁĘDU 1: Dodano 'await', ponieważ createClient() na serwerze 
  // często zwraca Promise (ze względu na obsługę ciasteczek).
  const supabase = await createClient();

  // 1. Pobierz wszystkie subskrypcje z tabeli push_subscriptions
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('subscription_data');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs) return NextResponse.json({ success: true, count: 0 });

  // ROZWIĄZANIE BŁĘDU 2: Dodano typ 'any' (lub konkretny interfejs) dla parametru 'sub', 
  // aby TypeScript wiedział, jak obsłużyć dane.
  const notifications = subs.map((sub: any) => 
    webpush.sendNotification(
      sub.subscription_data,
      JSON.stringify({
        title: title,
        body: message,
        icon: '/android-chrome-192x192.png',
        data: { url: '/' }
      })
    ).catch(err => {
      console.error('Błąd wysyłki do subskrypcji:', err.statusCode);
    })
  );

  await Promise.all(notifications);

  return NextResponse.json({ success: true, count: subs.length });
}