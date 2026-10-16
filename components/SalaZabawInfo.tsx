import { Cake, Coffee, Gamepad2, Gift, Phone, Mail, ChevronDown } from "lucide-react"

// Treść opisowa sali zabaw (fakty z lecewkulki.eu, opisane własnymi słowami - bez kopiowania,
// żeby nie dublować treści między domenami). Bez framer-motion: zwykły HTML widoczny dla Google.

const PHONE = "+48 666 504 555"
const PHONE_HREF = "tel:+48666504555"
const EMAIL = "kontakt@lecewkulki.eu"
const FACEBOOK = "https://www.facebook.com/salazabaw.lecewkulki"

const blocks = [
  {
    icon: Gift,
    title: "Sala zabaw dla dzieci w Białobrzegach",
    text: "Lecę w Kulki to sala zabaw przy ul. Targowickiej 4 w Białobrzegach. Część dla dzieci zajmuje osobne piętro: są tu baseny z kulkami, zjeżdżalnie i labirynty, w których maluchy mogą się wyszaleć bez pośpiechu, a przy okazji ćwiczyć sprawność i zawierać nowe znajomości.",
  },
  {
    icon: Cake,
    title: "Urodziny w sali zabaw",
    text: "Organizujemy przyjęcia urodzinowe od A do Z: pomagamy zaplanować imprezę, zapewniamy miejsca do wspólnego poczęstunku i słodkie niespodzianki, a po zabawie sprzątamy za Was. Solenizant i goście mają do dyspozycji wszystkie atrakcje sali. Wolne terminy i pakiety urodzinowe najlepiej sprawdzić telefonicznie.",
  },
  {
    icon: Coffee,
    title: "Kawiarnia dla rodziców",
    text: "Na parterze działa kawiarnia z dobrą kawą i przekąskami, a sala zabaw mieści się piętro wyżej. To wygodne miejsce na chwilę oddechu przed zabawą, po niej albo w trakcie przyjęcia urodzinowego.",
  },
  {
    icon: Gamepad2,
    title: "Strefa gier i vouchery",
    text: "W strefie gier czekają automaty: klasyczne gry, wyścigi samochodowe i nowsze tytuły, dla dzieci, nastolatków i dorosłych. Na prezent sprawdzi się voucher, od jednorazowego wejścia do sali zabaw po cały pakiet urodzinowy.",
  },
]

const faq: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: "Gdzie znajduje się sala zabaw Lecę w Kulki?",
    a: "Przy ul. Targowickiej 4, 26-800 Białobrzegi. To osobny lokal niż Sklep Urwis, który działa przy ul. Reymonta 38A.",
  },
  {
    q: "W jakich godzinach działa sala zabaw?",
    a: `Zapraszamy codziennie w godzinach 11:00–19:00. W święta godziny bywają inne, a w czasie przyjęć urodzinowych sala jest zarezerwowana na wyłączność. Aktualne godziny kawiarenki i sali zabaw publikujemy co poniedziałek na Facebooku Lecę w Kulki.`,
    link: { href: FACEBOOK, label: "Zobacz godziny na Facebooku" },
  },
  {
    q: "Jak zarezerwować urodziny dla dziecka?",
    a: `Zadzwoń pod numer ${PHONE} albo napisz na ${EMAIL}. Podamy wolne terminy i szczegóły pakietów urodzinowych.`,
  },
  {
    q: "Czy podczas urodzin sala zabaw jest tylko dla naszych gości?",
    a: "Tak, na czas przyjęcia urodzinowego sala zabaw jest zarezerwowana na wyłączność dla solenizanta i zaproszonych gości.",
  },
  {
    q: "Czy rodzice mogą odpocząć, gdy dzieci się bawią?",
    a: "Tak, na parterze działa kawiarnia z kawą i przekąskami. Sala zabaw mieści się piętro wyżej.",
  },
  {
    q: "Czy można kupić voucher na prezent?",
    a: "Tak, dostępne są vouchery na pojedyncze wejście do sali zabaw oraz na pakiet urodzinowy. Szczegóły podamy telefonicznie lub mailowo.",
  },
]

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    "name": "Lecę w Kulki – sala zabaw i kawiarnia",
    "url": "https://lecewkulki.eu/",
    "telephone": "+48666504555",
    "email": EMAIL,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ul. Targowicka 4",
      "addressLocality": "Białobrzegi",
      "postalCode": "26-800",
      "addressCountry": "PL",
    },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "11:00",
      "closes": "19:00",
    }],
    "sameAs": [FACEBOOK, "https://instagram.com/lecew_kulki"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  },
]

export default function SalaZabawInfo() {
  return (
    <section className="py-24 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-5xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map(({ icon: Icon, title, text }) => (
            <article key={title} className="p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-sm">
              <div className="w-14 h-14 mb-5 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 text-[#0055ff]">
                <Icon size={26} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-3">{title}</h2>
              <p className="text-zinc-700 text-base leading-relaxed">{text}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={PHONE_HREF} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0055ff] text-white rounded-4xl font-black tracking-wide shadow-xl hover:scale-105 transition-all">
            <Phone size={20} aria-hidden="true" /> {PHONE}
          </a>
          <a href={`mailto:${EMAIL}`} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-zinc-100 text-zinc-900 rounded-4xl font-black tracking-wide shadow-md hover:bg-zinc-50 transition-all">
            <Mail size={20} aria-hidden="true" /> {EMAIL}
          </a>
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight uppercase italic text-center mb-8">
            Najczęstsze pytania
          </h2>
          <div className="space-y-3">
            {faq.map(({ q, a, link }) => (
              <details key={q} className="group rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm open:bg-white">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 font-black text-zinc-900">
                  {q}
                  <ChevronDown size={20} className="shrink-0 text-[#0055ff] transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-6 pb-6 -mt-1 text-zinc-700 leading-relaxed">
                  {a}
                  {link && (
                    <>
                      {" "}
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0055ff] underline underline-offset-2">{link.label}</a>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500 mt-6">
            Aktualności i zdjęcia z sali zabaw znajdziesz na{" "}
            <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0055ff] underline underline-offset-2">Facebooku Lecę w Kulki</a>.
          </p>
        </div>
      </div>
    </section>
  )
}
