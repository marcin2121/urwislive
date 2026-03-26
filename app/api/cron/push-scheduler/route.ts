import { NextResponse } from 'next/server';
import { initWebPush } from '@/lib/push-server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  // Zabezpieczenie przed wywołaniem przez osoby postronne
  // Vercel dodaje ten nagłówek automatycznie przy CRON
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // 1. 🕒 WYSYŁKA ZAPLANOWANYCH POWIADOMIEŃ
    const { data: scheduledPushes } = await supabase
      .from('push_history')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now); // Pobierz tylko te, których czas już nadszedł

    if (scheduledPushes && scheduledPushes.length > 0) {
      // Bezpieczna inicjalizacja VAPID
      const isPushReady = initWebPush();

      if (isPushReady) {
        for (const push of scheduledPushes) {
          // Pobierz odbiorców dla danego tematu
          let query = supabase.from('push_subscriptions').select('subscription_data');
          if (push.topic !== 'wszystkie') {
            query = query.or(`topics.cs.{"${push.topic}"},topics.cs.{"wszystkie"}`);
          }
          const { data: subs } = await query;

          if (subs) {
            const payload = JSON.stringify({
              title: push.title,
              body: push.message,
              image: push.image_url,
              icon: '/android-chrome-192x192.png',
              data: { url: `/?utm_campaign=scheduled_push_${push.topic}` }
            });

            // Wyślij do wszystkich
            await Promise.all(subs.map(s => 
              webpush.sendNotification(s.subscription_data, payload).catch(() => null)
            ));
          }

          // Zmień status na wysłane
          await supabase
            .from('push_history')
            .update({ status: 'sent', created_at: now })
            .eq('id', push.id);
        }
      } else {
        console.warn('[CRON] Pominięto wysyłkę zaplanowanych powiadomień - brak konfiguracji VAPID.');
      }
    }

    // 2. 🧹 SPRZĄTANIE WYGASŁYCH PROMOCJI
    const { error: cleanupError } = await supabase
      .from('promocje')
      .update({ is_active: false })
      .lte('expires_at', now)
      .eq('is_active', true);

    return NextResponse.json({ 
      success: true, 
      processedPushes: scheduledPushes?.length || 0,
      timestamp: now 
    });

  } catch (error: any) {
    console.error('CRON Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}