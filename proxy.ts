import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Dopasowuj wszystkie ścieżki OPRÓCZ:
     * - _next/static (pliki statyczne)
     * - _next/image (optymalizacja obrazów)
     * - favicon.ico, sw.js, manifest itp.
     * - pliki statyczne (svg, png, jpg, ico, webp, woff2)
     */
    '/((?!_next/static|_next/image|serwist|api/chat|favicon.ico|sw\\.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|mp4|webm)).*)',
  ],
}
