import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}