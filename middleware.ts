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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // Manejar preflight requests
  if (request.method === 'OPTIONS') {
    return response
  }

  const pathname = request.nextUrl.pathname

  // Skip middleware para rutas que no necesitan auth
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/_next/webpack-hmr') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/) ||
    authRoutes.includes(pathname) ||
    publicRoutes.includes(pathname)
  ) {
    return response
  }

  try {
    // DIAGNÓSTICO de problemas intermitentes
    const authHeader = request.headers.get('authorization')
    const jwtSize = authHeader ? new Blob([authHeader]).size : 0
    
    if (jwtSize > 8000) {
      console.warn('🚨 [Middleware] Large JWT detected:', jwtSize, 'bytes - posible problema intermitente')
    }
    
    const { supabase, response: supabaseResponse } = createClient(request)

    // Intentar obtener user con retry para problemas intermitentes
    let user = null
    let authError = null
    const maxAuthRetries = 2
    
    for (let attempt = 1; attempt <= maxAuthRetries; attempt++) {
      try {
        const authResult = await supabase.auth.getUser()
        user = authResult.data?.user
        authError = authResult.error
        
        if (authError) {
          console.error(`🚨 [Middleware] Auth error (attempt ${attempt}):`, authError.message)
          if (authError.message?.includes('JWT') || authError.message?.includes('invalid')) {
            console.error('🚨 [Middleware] JWT/Token error detected - clearing session')
          }
        }
        
        break // Éxito, salir del retry loop
        
      } catch (err) {
        console.error(`🚨 [Middleware] Auth exception (attempt ${attempt}):`, err)
        if (attempt === maxAuthRetries) {
          authError = err
        }
      }
    }

    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth')
    ) {
      // No user, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
    
  } catch (error) {
    console.error('🚨 [Middleware] Critical error:', error)
    // En caso de error crítico, permitir el acceso pero loggearlo
    return response
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