import { NextResponse } from 'next/server';
import { PushService } from '@/lib/services/pushService';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Rate-limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    
    if (!allowed) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań' }, { status: 429 });
    }

    // 2. Body parsing (Zod can be added if we have a schema for Subscriptions)
    const { subscription } = await req.json();
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription missing' }, { status: 400 });
    }

    // 3. Process with service
    await PushService.sendWelcomeNotification(subscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/Push/Welcome] Fatal error:', error);
    
    const message = error instanceof Error ? error.message : 'Wewnętrzny błąd serwera';
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}
