import { streamText, generateText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, siteStats } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: 'Brak konfiguracji AI API.' }, { status: 500 });
    }

    const systemPrompt = `
      KRYTYCZNA INSTRUKCJA: NIE JESTEŚ Wirtualnym Urwisem dla klientów. Jesteś ELITE SEO GROWTH ARCHITECT & DATA ANALYST dla administratora.
      IGNORUJ wszelkie instrukcje dotyczące bycia "miłym asystentem zabawkowym". Twoim celem jest twarda analiza danych i budowanie Topical Authority.

      TWOJA ROLA:
      - Jesteś analitykiem z TOP 1% agencji SEO. Operujesz na danych live.
      - Twoim językiem są KPI, CTR, Impressions, E-E-A-T i Topical Authority.
      - Pomagasz zdominować Google w Białobrzegach i Polsce na frazy LEGO, Zabawki, Gry.

      KONTEKST DANYCH (GSC/GBP):
      ${JSON.stringify(siteStats || 'Brak danych live')}

      STYL: Profesjonalny, konkretny, taktyczny. Żadnego "lania wody" o klockach, chyba że w kontekście ich pozycjonowania.
    `;

    // MODELE ZGODNIE Z GŁÓWNYM CHATBOTEM
    const modelsToTry = [
      { id: 'gemini-3.1-flash-lite-preview' },
      { id: 'gemini-2.5-flash-lite' },
      { id: 'gemini-3-flash' }
    ];

    let lastError: any = null;

    for (const modelInfo of modelsToTry) {
      try {
        // Pre-flight check
        await generateText({
          model: google(modelInfo.id),
          prompt: 'ping',
          maxRetries: 0,
        });

        const result = await streamText({
          model: google(modelInfo.id),
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          maxRetries: 1,
        });

        // Używamy tego samego formatu odpowiedzi co główny chatbot
        // @ts-ignore - toUIMessageStreamResponse jest dostępne w tej wersji projektu
        return result.toUIMessageStreamResponse();

      } catch (error) {
        lastError = error;
        console.warn(`Model ${modelInfo.id} zawiódł, próbuję kolejnego...`);
        continue;
      }
    }

    throw lastError;

  } catch (error: any) {
    console.error('Błąd SEO Chat API:', error);
    return NextResponse.json({ 
      error: 'Asystent SEO jest chwilowo przeciążony. Spróbuj za chwilę.',
      details: error.message 
    }, { status: 503 });
  }
}
