import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Configuraciones más tolerantes para modo incógnito
        storageKey: 'supabase-auth-token',
        storage: typeof window !== 'undefined' ? {
          getItem: (key: string) => {
            try {
              return localStorage.getItem(key)
            } catch {
              // Fallback para modo incógnito donde localStorage puede fallar
              return null
            }
          },
          setItem: (key: string, value: string) => {
            try {
              localStorage.setItem(key, value)
            } catch {
              // Ignorar errores en modo incógnito
            }
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key)
            } catch {
              // Ignorar errores en modo incógnito
            }
          }
        } : undefined
      },
      global: {
        headers: {
          'X-Client-Info': 'vino-rodante-web'
        }
      }
    }
  )
} 