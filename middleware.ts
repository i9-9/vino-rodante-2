import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Lista de rutas públicas
const publicRoutes = [
  '/',
  '/products',
  '/collections',
  '/about',
  '/contact',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/reset-password',
  '/auth/update-password',
  '/auth/sign-up-success',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  let cookiesWereSet = false

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
              cookiesWereSet = true
            })
          } catch (error) {
            // Si ocurre error en set (por ejemplo, en Server Component), ignorar
          }
        },
      },
    }
  )

  // Refresca la sesión si está expirada
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('Supabase user in middleware:', user, 'Error:', userError)

  // Rutas protegidas
  if (request.nextUrl.pathname.startsWith('/account') && userError) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // Rutas públicas
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith('/collections/') ||
    request.nextUrl.pathname.startsWith('/products/')
  )

  // Si no hay usuario y la ruta no es pública, redirige a login
  if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Solo devolver la response con cookies si realmente hubo cambios
  return cookiesWereSet ? response : NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
} 