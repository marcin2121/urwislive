import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:kontakt@sklep-urwis.pl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json();

    const payload = JSON.stringify({
        title: 'Przybita piątka! Urwis melduje się 🐾',
        body: 'Kliknij i wybierz: Sklep czy Sala Zabaw? Dopasuj powiadomienia do siebie!',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        data: {
          url: '/?settings=open' // Ten sam link, który obsłuży automatyczne otwarcie dzwonka
        }
      });

    await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd powitalnego pusha:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}