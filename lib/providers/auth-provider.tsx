"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { createBrowserClient } from '@supabase/ssr'
import type { AuthContextType, AuthError, AuthLoadingState, User } from "@/lib/types/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<AuthLoadingState>({
    isInitializing: true,
    isSigningIn: false,
    isSigningUp: false,
    isSigningOut: false
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...')
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('[Auth] Error getting initial session:', error)
          setUser(null)
          setSession(null)
          return
        }
        console.log('[Auth] Initial session:', session)
        setSession(session)
        if (session?.user) {
          console.log('[Auth] Fetching customer data for user:', session.user.id)
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
          
          if (customerError) {
            console.error('[Auth] Error fetching customer data:', customerError)
            setUser({ 
              ...(session.user as User), 
              is_admin: false, 
              customerError: {
                message: customerError.message,
                code: customerError.code
              }
            })
          } else {
            console.log('[Auth] Customer data fetched successfully:', customer)
            setUser({ ...(session.user as User), is_admin: customer.is_admin })
          }
        } else {
          console.log('[Auth] No user in session')
          setUser(null)
        }
      } catch (err) {
        console.error('[Auth] Exception in initializeAuth:', err)
        setUser(null)
        setSession(null)
      } finally {
        setIsLoading(prev => ({ ...prev, isInitializing: false }))
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', { event, session })
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('[Auth] Token refreshed')
        setSession(session)
        return
      }

      try {
        setSession(session)
        if (session?.user) {
          console.log('[Auth] Fetching customer data after auth change for user:', session.user.id)
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
          
          if (customerError) {
            console.error('[Auth] Error fetching customer data after auth change:', customerError)
            setUser({ 
              ...(session.user as User), 
              is_admin: false, 
              customerError: {
                message: customerError.message,
                code: customerError.code
              }
            })
          } else {
            console.log('[Auth] Customer data fetched successfully after auth change:', customer)
            setUser({ ...(session.user as User), is_admin: customer.is_admin })
          }
        } else {
          console.log('[Auth] No user in session after auth change')
          setUser(null)
        }
      } catch (err) {
        console.error('[Auth] Exception in auth state change:', err)
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      console.log('[Auth] Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(prev => ({ ...prev, isSigningIn: true }))
      console.log('[Auth] Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      })
      
      if (error) {
        console.error('[Auth] Error signing in:', error)
        return { 
          error: {
            message: error.message,
            code: error.code
          }
        }
      }

      if (!data.session) {
        console.error('[Auth] No session returned after successful sign in')
        return { 
          error: {
            message: 'No session returned',
            code: 'NO_SESSION'
          }
        }
      }

      console.log('[Auth] Sign in successful:', {
        userId: data.user?.id,
        hasSession: !!data.session,
        hasAccessToken: !!data.session.access_token
      })

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('is_admin')
        .eq('id', data.user.id)
        .single()

      if (customerError) {
        console.error('[Auth] Error fetching customer data after sign in:', customerError)
        return { 
          error: {
            message: customerError.message,
            code: customerError.code
          }
        }
      }

      console.log('[Auth] Customer data fetched successfully:', customer)
      setUser({ ...(data.user as User), is_admin: customer.is_admin })
      
      return { error: null }
    } catch (err) {
      console.error('[Auth] Exception in signIn:', err)
      return { 
        error: {
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          code: 'UNKNOWN_ERROR'
        }
      }
    } finally {
      setIsLoading(prev => ({ ...prev, isSigningIn: false }))
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(prev => ({ ...prev, isSigningUp: true }))
      console.log('[Auth] Attempting sign up for:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })

      if (error) {
        return { 
          data: null, 
          error: {
            message: error.message,
            code: error.code
          }
        }
      }

      if (data.user && !error) {
        console.log('[Auth] Creating customer record for:', data.user.id)
        const { error: insertError } = await supabase.from("customers").insert({
          id: data.user.id,
          name: name,
          email: email,
        })

        if (insertError) {
          console.error('[Auth] Error creating customer:', insertError)
          return { 
            data, 
            error: {
              message: insertError.message,
              code: insertError.code
            }
          }
        }
        console.log('[Auth] Customer record created successfully')
      }

      return { data, error: null }
    } catch (err) {
      console.error('[Auth] Exception in signUp:', err)
      return { 
        data: null, 
        error: {
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          code: 'UNKNOWN_ERROR'
        }
      }
    } finally {
      setIsLoading(prev => ({ ...prev, isSigningUp: false }))
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(prev => ({ ...prev, isSigningOut: true }))
      console.log('[Auth] Attempting sign out')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] Error during signOut:', error)
        throw {
          message: error.message,
          code: error.code
        }
      }
      
      console.log('[Auth] Sign out successful')
      setUser(null)
      setSession(null)
      
      window.location.href = '/'
    } catch (err) {
      console.error('[Auth] Exception during signOut:', err)
      throw {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        code: 'UNKNOWN_ERROR'
      }
    } finally {
      setIsLoading(prev => ({ ...prev, isSigningOut: false }))
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
