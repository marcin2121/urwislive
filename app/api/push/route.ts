import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

// Bezpieczna inicjalizacja VAPID
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:kontakt@sklep-urwis.pl',
    publicKey,
    privateKey
  );
}

export async function POST(req: Request) {
  try {
    // Rate-limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań' }, { status: 429 });
    }

    const { subscription, title, message, topic } = await req.json();

    if (!publicKey || !privateKey) {
      throw new Error('Brak kluczy VAPID');
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ 
        title, 
        body: message, 
        icon: '/android-chrome-192x192.png',
        data: { 
          url: `/?utm_source=pwa_push&utm_medium=notification&utm_campaign=push_${topic || 'general'}` 
        }
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd wysyłki:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
