import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

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
  try {
    console.log('[Middleware] Request URL:', request.url)
    const allCookies = request.cookies.getAll()
    console.log('[Middleware] Request cookies:', allCookies)

    // Create an unmodified response
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
            const cookies = request.cookies.getAll()
            console.log('[Middleware] getAll cookies:', cookies)
            return cookies
          },
          setAll(cookiesToSet) {
            console.log('[Middleware] setAll cookies:', cookiesToSet)
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = {
                ...options,
                secure: true,
                sameSite: 'lax' as const,
                path: '/',
                domain: '.vinorodante.com',
              }
              console.log('[Middleware] Setting cookie:', { name, value, options: cookieOptions })
              request.cookies.set(name, value)
            })
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = {
                ...options,
                secure: true,
                sameSite: 'lax' as const,
                path: '/',
                domain: '.vinorodante.com',
              }
              console.log('[Middleware] Setting response cookie:', { name, value, options: cookieOptions })
              response.cookies.set(name, value, cookieOptions)
            })
          },
        },
      },
    )

    // This will refresh session if expired - required for Server Components
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('[Middleware] User auth check:', { user, userError })

    // protected routes
    if (request.nextUrl.pathname.startsWith("/account") && userError) {
      console.log('[Middleware] Protected route access denied:', request.nextUrl.pathname)
      return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith('/collections/') ||
      request.nextUrl.pathname.startsWith('/products/')
    )
    console.log('[Middleware] Route check:', { 
      path: request.nextUrl.pathname, 
      isPublic: isPublicRoute 
    })

    // If no user and trying to access protected routes, redirect to login
    if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/auth')) {
      console.log('[Middleware] Redirecting to login from:', request.nextUrl.pathname)
      const redirectUrl = new URL('/auth/sign-in', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    console.log('[Middleware] Final response cookies:', response.cookies.getAll())
    return response
  } catch (e) {
    console.error('[Middleware] Error:', e)
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
} 