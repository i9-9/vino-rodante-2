import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (process.env.NODE_ENV === 'production') {
                options.domain = 'www.vinorodante.com'
                options.secure = true
              }
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore if called from a Server Component
          }
        },
      },
    }
  )
} 