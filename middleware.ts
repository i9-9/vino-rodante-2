import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// List of public routes that don't require authentication
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
  console.log('[Middleware] Processing request:', request.nextUrl.pathname)

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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('[Middleware] Error getting user:', error)
      return response
    }

    console.log('[Middleware] Session status:', user ? 'active' : 'none')

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith('/collections/') ||
      request.nextUrl.pathname.startsWith('/products/')
    )

    // If no user and trying to access protected routes, redirect to login
    if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/auth')) {
      console.log('[Middleware] Redirecting to login from:', request.nextUrl.pathname)
      const redirectUrl = new URL('/auth/sign-in', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error)
    return response
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
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 