import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow enough time for AI to think

// Define the response schema explicitly for strict AI output
const aiInsightSchema = z.object({
  insights: z.array(z.object({
    id: z.number().describe('Unikalny numer ID, np. od 1 do 5'),
    type: z.enum(['warning', 'success', 'info']).describe('Typ powiadomienia SEO'),
    message: z.string().describe('Konkretna wiadomość analityczna co zaszło lub się podoba/nie podoba.'),
    actionPlan: z.string().describe('Jedno/dwuzdaniowa instrukcja naprawy lub optymalizacji.'),
  })).max(4).describe('Maksymalnie 4 najważniejsze obserwacje.')
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { gscData, gbpData } = json;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Brak klucza API dla analizy AI.' },
        { status: 500 }
      );
    }

    if (!gscData || !gbpData) {
        return NextResponse.json(
          { error: 'Brak danych do analizy. Prześlij GSC i GBP w zapytaniu.' },
          { status: 400 }
        );
    }

    // Prepare context payload based on user's live data
    const context = `
      Jesteś Sklep Urwis Elite SEO Analyst, bezlitosnym, nastawionym na zysk doradcą analitycznym. 
      Przeanalizuj poniższe dane pozyskane bezpośrednio z Google Search Console i Google Business Profile.
      Sklep znajduje się w "Białobrzegach" stąd duży nacisk na to miasto i zapytania LOKALNE typu zabawki/lego.
      Wygeneruj 3 trafne obserwacje ukierunkowane na realną poprawę tych wskaźników lub na pochwalenie obecnego formatu.

      DANE GSC:
      Kliknięcia (28 dni): ${gscData?.stats?.clicks}
      Wyświetlenia: ${gscData?.stats?.impressions}
      Wsp. odrzuceń(CTR): ${gscData?.stats?.ctr}
      Średnia pozycja: ${gscData?.stats?.position}
      Najlepsze w tym okresie keywordy: ${JSON.stringify(gscData?.queries || [])}

      DANE GBP (Maps):
      Status Wizytówki: ${gbpData?.locationRetrieved}
      (Zakładaj brak głębokich danych GBP jako problem integracyjny lub po prostu pochwal strukturę z SEO).

      Ograniczenia: Zwróć DOKŁADNIE strukturę JSON, całkowicie po Polsku.
    `;

    // Calling Gemini Model
    const result = await generateObject({
      model: google('gemini-2.5-flash-lite'), // Fast processing model like chatbot fallback
      schema: aiInsightSchema,
      prompt: context,
    });

    return NextResponse.json({ success: true, data: result.object.insights });

  } catch (error: any) {
    console.error('[API/SEO-AI] Fatal error:', error);
    return NextResponse.json(
      { error: 'Asystent AI analizy SEO napotkał tymczasowy problem.', details: error.message },
      { status: 503 }
    );
  }
}
