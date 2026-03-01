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

  // 1. Ochrona strefy klienta (np. profil, rabaty)
  // UWAGA: Skoro usunęliśmy starą kartę, profil jest chroniony bezpośrednio w swoim pliku page.tsx, ale jeśli masz jakieś "protected", zostawiamy to:
  if (
    request.nextUrl.pathname.startsWith('/protected') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/strefa-zabawy/urwisek' // Odsyłamy na stronę logowania do Urwiska
    return NextResponse.redirect(url)
  }

  // 2. RESTRYKCYJNA OCHRONA PANELU ADMINISTRATORA
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Sprawdzamy czy użytkownik w ogóle istnieje
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/' // Niezalogowany? Na stronę główną
      return NextResponse.redirect(url)
    }

    // Sprawdzamy, czy w metadanych (user_metadata) ma wpisaną rolę "admin"
    const isAdmin = user.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/' // Zalogowany, ale nie jest adminem? Na stronę główną
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}