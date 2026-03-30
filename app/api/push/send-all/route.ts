import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; 
import { sendAllPushSchema } from '@/lib/validations/push';
import { PushService } from '@/lib/services/pushService';
import { } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * Handle POST requests to broadcast push notifications.
 * 
 * Verifies admin identity, validates payload with Zod, and delegates to PushService.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    
    // 1. Authorization: Only admin can broadcast
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'admin@sklep-urwis.pl') {
      console.warn('[API/Push/SendAll] Unauthorized attempt by:', user?.email || 'unknown');
      return NextResponse.json({ error: 'Brak dostępu' }, { status: 403 });
    }

    // 2. Body parsing and Zod validation
    const json = await req.json();
    const validation = sendAllPushSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request payload', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // 3. Delegation to PushService
    const result = await PushService.broadcast(validation.data);

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      category: result.category
    });

  } catch (error) {
    console.error('[API/Push/SendAll] Critical error:', error);
    
    const message = error instanceof Error ? error.message : 'Wewnętrzny błąd serwera';
    const status = message.includes('not configured') ? 503 : 500;
    
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status });
  }
}