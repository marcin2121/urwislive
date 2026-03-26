import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { initWebPush } from '@/lib/push-server';
import webpush from 'web-push';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Inicjalizacja Web Push
    const isPushReady = initWebPush();
    if (!isPushReady) {
      console.warn('[PUSH] Pominięto wysyłkę powitalną - brak konfiguracji VAPID.');
      return NextResponse.json({ error: 'Push service not configured' }, { status: 503 });
    }

    // 2. Rate-limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań' }, { status: 429 });
    }

    const { subscription } = await req.json();

    const payload = JSON.stringify({
        title: 'Przybita piątka! Urwis melduje się 🐾',
        body: 'Kliknij i wybierz: Sklep czy Sala Zabaw? Dopasuj powiadomienia do siebie!',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        data: {
          url: '/?settings=open'
        }
      });

    await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd powitalnego pusha:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
