import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Rate-limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Zbyt wiele zapytań' }, { status: 429 });
    }

    const { action, url } = await req.json();
    const supabase = await createClient();
    
    // Zapis do naszej nowej tabeli!
    await supabase.from('push_analytics').insert([{ action, url }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
