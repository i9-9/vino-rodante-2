import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Lista de rutas de auth (las únicas que pueden necesitar manejo especial)
const authRoutes = [
  '/auth/sign-in',
  '/auth/sign-up', 
  '/auth/reset-password',
  '/auth/update-password',
  '/auth/sign-up-success',
  '/auth/callback',
  '/auth/auth-code-error',
  '/auth/clear-session',
]

// Lista de rutas que pueden necesitar auth en el futuro (admin, dashboard)
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/profile',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si el usuario no está autenticado y trata de acceder a rutas protegidas
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/account') ||
      request.nextUrl.pathname.startsWith('/checkout'))
  ) {
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}