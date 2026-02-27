import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, amount } = body; // np. type: 'hunger', amount: 10

    // Tutaj logika aktualizacji punktów w bazie danych
    const { error } = await supabase
      .from('loyalty_cards')
      .update({ 
        // Przykład: zwiększamy monety lub XP
        experience: supabase.rpc('increment', { row_id: user.id, x: amount }) 
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}