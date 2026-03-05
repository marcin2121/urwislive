import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { askCrystalBall } from '@/lib/magic';
import { PROJECT_CONTEXT } from '@/lib/project-context';

// Pozwala uniknąć timeoutów na Vercel (zapobiega net::ERR_INCOMPLETE_CHUNKED_ENCODING)
export const maxDuration = 60;
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
model: google('gemini-3.1-flash-lite-preview'),
    system: `${PROJECT_CONTEXT}

TWOJE NAJWAŻNIEJSZE ZASADY:
1. Twoja wiedza o projekcie powyżej jest nadrzędna – używaj jej, aby nawigować użytkownika po stronie.
2. Jeśli klient pyta o dostępność jakiegokolwiek produktu, ZAWSZE używaj narzędzia 'guessStockMagic'.
3. Po użyciu narzędzia, przekaż wylosowaną odpowiedź z humorem.
4. Bądź zwięzły, używaj emoji i nie bój się rzucić suchym żartem.
5. Twoim celem jest sprawienie, by klient się uśmiechnął i chciał odwiedzić Sklep Urwis osobiście.
6. Jeśli klient pyta o cenę odpowiadaj w wymyślonej walucie w śmieszny sposób.`,
    messages,
    tools: {
      guessStockMagic: tool({
        description: 'Używa magicznej kuli, aby wywróżyć (wymyślić w formie żartu) dostępność produktu. Używaj ZAWSZE, gdy padnie pytanie o produkt.',
        parameters: z.object({
          productName: z.string().describe('Nazwa produktu, o który pyta klient (np. "czerwone buty", "kubek").'),
        }),
        // TUTA DODAJEMY TYP: { productName: string }
     execute: async (args) => {
  const funnyResponse = await askCrystalBall(args.productName);
  return {
    product: args.productName,
    magicVerdict: funnyResponse,
          };
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}