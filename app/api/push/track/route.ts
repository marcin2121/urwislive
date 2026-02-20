import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { action, url } = await req.json();
    const supabase = await createClient();
    
    // Zapis do naszej nowej tabeli!
    await supabase.from('push_analytics').insert([{ action, url }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}