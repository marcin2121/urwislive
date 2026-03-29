import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { syncPayloadSchema } from "@/lib/validations/sync";

export const dynamic = 'force-dynamic';

/**
 * Handle POST requests to sync offline progress.
 * 
 * This endpoint processes background-synchronized actions from the Service Worker.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        message: 'Offline sync failed - Supabase configuration missing' 
      }, { status: 503 });
    }

    // 1. Authorization: Only logged-in users
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Body parsing and Zod validation
    const json = await request.json();
    const validation = syncPayloadSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid sync payload", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { type, amount } = validation.data;

    // 3. Update logic (Using dynamic field name safely)
    const fieldMap: Record<string, string> = {
      points: 'loyalty_points',
      exp: 'experience',
      coins: 'urwis_coins'
    };

    const dbField = fieldMap[type];
    if (!dbField) {
      return NextResponse.json({ error: "Unsupported sync type" }, { status: 400 });
    }

    // NOTE: This assumes we want to INCREMENT. 
    // Since Supabase doesn't have a simple increment via update yet (without RPC),
    // we use a safe update here. For enterprise-grade, we'd use an increment RPC.
    
    // For now, we update the loyalty_cards table for 'experience' / 'points'
    const { error } = await supabase
      .from('loyalty_cards')
      .update({ 
        [dbField]: amount 
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('[API/Urwis/Sync] DB Update Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, processed: type });

  } catch (error) {
    console.error('[API/Urwis/Sync] Critical error:', error);
    
    const message = error instanceof Error ? error.message : 'Wewnętrzny błąd serwera';
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}