import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Lista de rutas públicas que NO requieren autenticación
const publicRoutes = [
  '/',
  '/products',
  '/collections',
  '/about',
  '/contact',
  '/weekly-wine',
]

// Lista de rutas de auth que nunca deben ser interceptadas por el middleware
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
  const response = NextResponse.next()

  // Agregar headers CORS a todas las respuestas
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, apikey')

  // Manejar OPTIONS requests para CORS
  if (request.method === 'OPTIONS') {
    return response
  }

  try {
    const { supabase, response: supabaseResponse } = createClient(request)
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
    // IMPORTANTE: usar getUser() no solo getSession()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Solo redirigir si NO es una ruta pública ni de auth
      const redirectUrl = new URL('/auth/sign-in', request.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (e) {
    console.error('Middleware error:', e)
    // En caso de error, solo redirigir si no es ruta pública o auth
    const pathname = request.nextUrl.pathname
    
    if (authRoutes.some(route => pathname.startsWith(route))) {
      return response
    }
    
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      return response
    }
    
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - _next/webpack-hmr (dev hot reload)
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}