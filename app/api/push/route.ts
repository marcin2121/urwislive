import { NextResponse } from 'next/server';
import { PushService } from '@/lib/services/pushService';
import { sendPushSchema } from '@/lib/validations/push';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { z } from 'zod';

/**
 * Handle POST requests to send a push notification.
 * 
 * Validates the payload with Zod and processes using PushService.
 */
export async function POST(req: Request) {
  try {
    // 1. Rate-limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    
    if (!allowed) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań' }, { status: 429 });
    }

    // 2. Runtime validation
    const json = await req.json();
    const validation = sendPushSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request payload', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // 3. Process with service
    await PushService.sendNotification(validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/Push] Critical error:', error);
    
    const message = error instanceof Error ? error.message : 'Wewnętrzny błąd serwera';
    const status = message.includes('not configured') ? 503 : 500;
    
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status });
  }
}
