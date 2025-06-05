import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

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

  // SITIO PÚBLICO: Solo aplicar verificación de auth a rutas específicas
  // Todo lo demás es público (productos, colecciones, home, etc.)
  const needsAuth = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (
    !needsAuth ||  // Si no necesita auth, skip middleware
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/_next/webpack-hmr') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/) ||
    authRoutes.includes(pathname)
  ) {
    return response
  }

  try {
    // Solo aplicar diagnósticos a rutas que realmente necesiten auth
    const authHeader = request.headers.get('authorization')
    const jwtSize = authHeader ? new Blob([authHeader]).size : 0
    
    if (jwtSize > 8000) {
      console.warn('🚨 [Middleware] Large JWT detected:', jwtSize, 'bytes - posible problema intermitente')
    }
    
    const { supabase, response: supabaseResponse } = createClient(request)

    // Verificar auth solo para rutas protegidas
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('🚨 [Middleware] Auth error:', authError.message)
    }

    // Solo redirigir si es una ruta protegida sin usuario
    if (!user && needsAuth) {
      console.log('🚨 [Middleware] Protected route accessed without auth:', pathname)
      // Aquí podrías redirigir a una página de auth si tuvieras una
      // Por ahora, permitir el acceso
    }

    return supabaseResponse
    
  } catch (error) {
    console.error('🚨 [Middleware] Critical error:', error)
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