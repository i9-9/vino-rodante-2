import type { Session, User as SupabaseUser } from "@supabase/supabase-js"

export type AuthError = {
  message: string
  code?: string
  status?: number
}

export type User = SupabaseUser & { 
  is_admin?: boolean
  customerError?: AuthError
}

export type AuthLoadingState = {
  isInitializing: boolean
  isSigningIn: boolean
  isSigningUp: boolean
  isSigningOut: boolean
}

export type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: AuthLoadingState
  isInitialized: boolean
  initError: string | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ data: unknown, error: AuthError | null }>
  signOut: () => Promise<void>
} 