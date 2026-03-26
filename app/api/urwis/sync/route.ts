import { createClient } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ success: true, message: 'Offline sync - Supabase configuration missing' });
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, amount } = body;

    // Tutaj logika aktualizacji punktów w bazie danych
    const { error } = await supabase
      .from('loyalty_cards')
      .update({ 
        experience: 0 
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}