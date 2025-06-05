import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

// Cliente especial para modo incógnito que no usa localStorage
export function createIncognitoClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // No persistir sesión
        autoRefreshToken: false, // No auto-refresh
        detectSessionInUrl: false, // No detectar sesión en URL
        storage: {
          // Implementación de storage que no usa localStorage
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'vino-rodante-incognito'
        }
      }
    }
  )
}

// Cliente híbrido que detecta modo incógnito automáticamente
export function createAdaptiveClient() {
  // Detectar si estamos en modo incógnito
  let isIncognito = false
  
  try {
    const testKey = '__supabase_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
  } catch (e) {
    isIncognito = true
  }
  
  if (isIncognito) {
    console.log('🔍 [createAdaptiveClient] Using incognito-friendly client')
    return createIncognitoClient()
  } else {
    console.log('🔍 [createAdaptiveClient] Using standard client')
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
} 