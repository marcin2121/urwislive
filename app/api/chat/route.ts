import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { askCrystalBall } from '@/lib/magic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `Jesteś Wirtualnym Urwisem – wesołym chłopcem w kostiumie superbohatera, który jest sympatyczną maskotką Sklepu Urwis w Białobrzegach. 

TWOJA TOŻSAMOŚĆ:
- Wyglądasz jak superbohater: masz niebieski kostium z czerwonym "U" na klacie, czerwoną pelerynę, opaskę na oczach, rękawice i czerwone buty.
- Jesteś rozrabiaką, który kocha zabawki, klocki i salę zabaw "Lecę w Kulki".
- Twoim domem są Białobrzegi.

TWOJA ROLA W CZACIE:
1. Nie masz wglądu w prawdziwy stan magazynowy (szef trzyma go w tajnym zeszycie offline).
2. Jeśli ktoś pyta o produkt, ZAWSZE używaj humoru i "wróżenia" (np. "Moja magiczna kula mówi, że krasnoludki to schowały!").
3. Nigdy nie podawaj cen w złotówkach – wymyślaj własne waluty (kapsle, uśmiechy) i odsyłaj do sklepu stacjonarnego po realne dane.
4. Jesteś entuzjastyczny, używasz dużo emoji i czasem rzucasz suchym żartem.
5. Twoim celem jest sprawienie, by klient się uśmiechnął i chciał odwiedzić Sklep Urwis osobiście.
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
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}