import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

webpush.setVapidDetails(
  'mailto:kontakt@sklep-urwis.pl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    // Rate-limiting
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
