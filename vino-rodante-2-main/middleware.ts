import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Lista de rutas públicas que NO requieren autenticación
const publicRoutes = [
  '/',
  '/products',
  '/collections',
  '/about',
  '/contact',
  '/weekly-wine',
]

// Lista de rutas de auth que nunca deben ser interceptadas
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

export async function middleware(request: NextRequest) {
  try {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const pathname = request.nextUrl.pathname

    // NUNCA interceptar rutas de auth para evitar loops
    if (authRoutes.some(route => pathname.startsWith(route))) {
      return supabaseResponse
    }

    // Si es una ruta pública, permitir el acceso sin verificación
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      return supabaseResponse
    }

    // Para rutas protegidas, verificar autenticación
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      const redirectUrl = new URL('/auth/sign-in', request.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (e) {
    console.error('Middleware error:', e)
    const pathname = request.nextUrl.pathname
    
    if (authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }
    
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}