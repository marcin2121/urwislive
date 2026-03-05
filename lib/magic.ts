// Zbiór zabawnych odpowiedzi, które bot będzie wplatał w rozmowę po wywołaniu narzędzia
export async function askCrystalBall(productName: string) {
  const jokes = [
    `Kryształowa kula mówi, że szef rano pił z tego kawę, więc raczej nie ma na sprzedaż.`,
    `Krasnoludki magazynowe podobno widziały to gdzieś za szafą, ale szansa na znalezienie wynosi 50/50!`,
    `Duchy sklepu szepczą, że jest na stanie, ale musisz przynieść ciastka, żeby Ci to wydali.`,
    `Układ gwiazd wskazuje, że wyprzedało się to w 1998 roku, ale szef twierdzi inaczej. Lepiej wpaść i sprawdzić samemu.`,
    `Ostatnio widziałem, jak sklepowe myszy uciekały z tym w stronę wyjścia. Trzeba spytać kierownika, czy udało się je złapać!`,
    `Wróżki mówią zdecydowane "MOŻE". Przyjdź do sklepu, to potraktujemy to jako misję poszukiwawczą.`,
    `Kula zrobiła się mętna... Z tego co widzę, ostatnia sztuka służy teraz jako podpórka do kiwającego się stołu na zapleczu.`,
    `System wyroczni twierdzi, że mamy to ukryte w tajnym skarbcu pod ladą. Zapytaj szefa o hasło!`
  ];

  // Symulacja "myślenia" magicznej kuli (opóźnienie dla lepszego efektu w UI)
  await new Promise(resolve => setTimeout(resolve, 800));

  // Losujemy jeden z żartów
  const randomIndex = Math.floor(Math.random() * jokes.length);
  return jokes[randomIndex];
}