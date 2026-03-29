import { NextResponse } from 'next/server';
import { initWebPush } from '@/lib/push-server';
import { ROUTES } from '@/lib/routes';
import webpush from 'web-push';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Bezpieczna inicjalizacja Web Push
    const isPushReady = initWebPush();
    if (!isPushReady) {
      return NextResponse.json({ error: 'Push service not configured' }, { status: 503 });
    }

    // 2. Rate-limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań' }, { status: 429 });
    }

    const { subscription, title, message, topic } = await req.json();

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ 
        title, 
        body: message, 
        icon: '/android-chrome-192x192.png',
        data: { 
          url: `${ROUTES.HOME}?utm_source=pwa_push&utm_medium=notification&utm_campaign=push_${topic || 'general'}` 
        }
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd wysyłki:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
