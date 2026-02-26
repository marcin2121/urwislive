import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Ochrona strefy klienta (Karta Lojalnościowa)
  if (
    request.nextUrl.pathname.startsWith('/protected') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/urwisek' // Odsyłamy na stronę logowania do Urwiska
    return NextResponse.redirect(url)
  }

  // 2. NOWE: Restrykcyjna ochrona panelu administratora
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Sprawdzamy, czy użytkownik jest zalogowany ORAZ czy to nasz konkretny email
    if (!user || user.email !== 'admin@sklep-urwis.pl') {
      const url = request.nextUrl.clone()
      url.pathname = '/urwisek' // Blokada dostępu: odsyłamy intruza na stronę główną/logowanie
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}