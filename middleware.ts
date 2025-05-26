import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

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
  '/auth/callback',
]

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    const { error } = await supabase.auth.getSession()

    if (error) {
      // If there's an error, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    // Si es una ruta pública, permitir el acceso sin verificación
    if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      return response
    }

    return response
  } catch (e) {
    // If there's an error, redirect to sign-in
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth folder (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
}