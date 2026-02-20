import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { title, text, url } = await req.json();
    const supabase = await createClient();
    
    // Zapisujemy odebrane dane do nowej tabeli
    const { error } = await supabase.from('shared_items').insert([{ 
      title: title || null, 
      text_content: text || null, 
      url: url || null 
    }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd cichego zapisu udostępnienia:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}