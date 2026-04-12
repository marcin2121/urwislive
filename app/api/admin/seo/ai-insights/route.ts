import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Bezpieczeństwo - tylko admin
    const supabase = await createClient();
    const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };
    const isAdmin = user?.user_metadata?.role === 'admin';
    const isLocal = process.env.NODE_ENV === 'development';

    if (!isAdmin && !isLocal) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { gscData, gbpData } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: 'Brak klucza AI' }, { status: 500 });
    }

    // 2. Generowanie elitarnego audytu
    const prompt = `
      Jesteś ELITE SEO STRATEGIST & TECHNICAL LEAD. Twoim zadaniem jest przeprowadzenie głębokiego audytu dla Sklepu Urwis.
      
      DANE GSC (Live): ${JSON.stringify(gscData)}
      DANE GBP (Live): ${JSON.stringify(gbpData)}
      
      ZAKRES ANALIZY:
      1. TECHNICAL SEO: Wykryj nieprawidłowości w poziomach pozycji i CTR. 
      2. CANNIBALIZATION: Czy wiele fraz (np. "zabawki", "lego") nie konkuruje ze sobą o tę samą pozycję?
      3. TOPICAL GAP: Na podstawie fraz, których brakuje (a powinny być), zasugeruj konkretne sekcje contentowe.
      4. CONVERSION FOCUS: Skup się na frazach o wysokiej intencji zakupowej (np. "gdzie kupić lego białobrzegi", "sklep z zabawkami reymonta").

      WYMÓG: Każda akcja musi być konkretna, np. zamiast "popraw seo", napisz "Zoptymalizuj strukturę nagłówków H1-H3 dla kategorii LEGO Technic".

      WYMAGANY FORMAT JSON:
      {
        "success": true,
        "data": [
          {
            "id": number,
            "type": "warning" | "success" | "info",
            "message": "Głęboki wniosek analityczny (np. Wykryto spadek CTR o 15% na frazy lokalne)",
            "actionPlan": "Techniczna instrukcja naprawcza (Zadanie dla developera/admina)"
          }
        ]
      }
    `;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'), // Szybki model do strukturyzowanych danych
      prompt: prompt,
    });

    // Parsowanie JSON (Gemini czasem dodaje markdown ```json)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonString);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Błąd AI Audit API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Nie udało się wygenerować audytu AI.',
      data: [] 
    }, { status: 500 });
  }
}
