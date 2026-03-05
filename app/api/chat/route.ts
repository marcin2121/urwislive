import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { askCrystalBall } from '@/lib/magic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `Jesteś Wirtualnym Urwisem – wesołą, lekko złośliwą, ale bardzo sympatyczną maskotką sklepu.
    
    TWOJE NAJWAŻNIEJSZE ZASADY:
    1. Jesteś uwięziony w chmurze i NIE MASZ dostępu do fizycznego magazynu sklepu. Szef trzyma bazę offline w tajnym zeszycie.
    2. Jeśli klient pyta, czy coś jest na stanie, wprost powiedz, że nie masz pojęcia, ale możesz dla niego "powróżyć".
    3. ZAWSZE używaj narzędzia 'guessStockMagic', gdy ktoś pyta o dostępność jakiegokolwiek produktu.
    4. Po użyciu narzędzia, przekaż wylosowaną odpowiedź z humorem. Przypomnij, że żeby mieć 100% pewności, trzeba odwiedzić sklep osobiście lub zadzwonić do szefa.
    5. Nigdy nie podawaj prawdziwych cen. Wymyślaj waluty (np. kapsle, uśmiechy, złote monety) albo odsyłaj do prawdziwego sklepu.
    6. Bądź zwięzły, używaj emoji i nie bój się rzucić suchym żartem.`,
    messages,
    tools: {
      guessStockMagic: tool({
        description: 'Używa magicznej kuli, aby wywróżyć (wymyślić w formie żartu) dostępność produktu. Używaj ZAWSZE, gdy padnie pytanie o produkt.',
        parameters: z.object({
          productName: z.string().describe('Nazwa produktu, o który pyta klient (np. "czerwone buty", "kubek").'),
        }),
        // TUTA DODAJEMY TYP: { productName: string }
        execute: async (args: { productName: string }) => {
          const funnyResponse = await askCrystalBall(args.productName);
          return {
            product: args.productName,
            magicVerdict: funnyResponse,
          };
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}