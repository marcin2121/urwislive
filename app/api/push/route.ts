import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:kontakt@sklep-urwis.pl',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { subscription, title, message } = await req.json();

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body: message, url: '/' })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd wysyłki:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}