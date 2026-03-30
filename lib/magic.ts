// Zbiór zabawnych odpowiedzi, które bot będzie wplatał w rozmowę po wywołaniu narzędzia
export async function askCrystalBall(_productName: string) {
  const jokes = [
    `Wróżki z działu kreatywnego mówią zdecydowane "MOŻE". Najlepiej wpadnij do nas na Reymonta 38A, to potraktujemy to jako misję poszukiwawczą!`,
    `Kryształowa kula pokazuje, że szef rano używał tego jako podstawki pod kawę... Ale czy to było to, czy tylko coś podobnego? Musisz zadzwonić i zapytać!`,
    `Krasnoludki magazynowe podobno widziały to gdzieś za szafą, ale szansa na znalezienie wynosi równe 50/50. Bez telefonu do szefa się nie dowiesz.`,
    `Moja wizja ulatuje... Ktoś chyba przywiązał tę informację do balonów z helem i poleciała pod sufit! Najlepiej wpaść i sprawdzić na własne oczy.`,
    `Układ gwiazd wskazuje, że wyprzedało się to w 1998 roku, ale szef twierdzi inaczej. Ja tam mu nie ufam, lepiej samemu sprawdzić na półkach.`,
    `Próbowałem to dojrzeć w kuli, ale drogę zablokowała mi ogromna wieża z LEGO. Szef jest jedynym, który zna bezpieczne przejście przez magazyn, żeby to sprawdzić!`,
    `Duchy sklepu nałożyły na mnie zaklęcie "Brak Danych". Widzę tylko mgłę i uśmiechnięte pluszaki. Musisz dopytać obsługę z krwi i kości!`,
    `Magik, który tu wczoraj był, sprawił, że cała moja wiedza o tym produkcie zniknęła. Szef wciąż szuka go po Białobrzegach, żeby odczarował system!`,
    `Wygląda na to, że zabawki zorganizowały strajk i schowały informacje o stanach magazynowych. Przyjdź do sklepu i pomóż nam negocjować!`,
    `Kula zrobiła się mętna... Jeśli to w ogóle u nas jest, to pewnie służy teraz jako podpórka do kiwającego się stołu na zapleczu. Kto wie? Tylko szef wie!`
  ];

  // Symulacja "myślenia" magicznej kuli (opóźnienie dla lepszego efektu w UI)
  await new Promise(resolve => setTimeout(resolve, 800));

  // Losujemy jeden z żartów
  const randomIndex = Math.floor(Math.random() * jokes.length);
  return jokes[randomIndex];
}