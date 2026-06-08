import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { initWebPush } from '@/lib/push-server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/routes';

export async function GET(req: Request) {
  // Zabezpieczenie przed wywołaniem przez osoby postronne
  // Vercel dodaje ten nagłówek automatycznie przy CRON
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Supabase configuration missing, skipping CRON' });
    }
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
            const filterStr = 'topics.cs.{"' + push.topic + '"},topics.cs.{"wszystkie"}';
            query = query.or(filterStr);
          }
          const { data: subs } = await query;

          if (subs) {
            const payload = JSON.stringify({
              title: push.title,
              body: push.message,
              image: push.image_url,
              icon: '/android-chrome-192x192.png',
              data: { url: `${ROUTES.HOME}?utm_campaign=scheduled_push_${push.topic}` }
            });

            // Wyślij do wszystkich
            await Promise.all(subs.map((s: { subscription_data: webpush.PushSubscription }) => 
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
    const { error: _cleanupError } = await supabase
      .from('promocje')
      .update({ is_active: false })
      .lte('expires_at', now)
      .eq('is_active', true);

    return NextResponse.json({ 
      success: true, 
      processedPushes: scheduledPushes?.length || 0,
      timestamp: now 
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('CRON Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}