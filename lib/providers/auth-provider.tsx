"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

// Extiendo el tipo de usuario para incluir is_admin
export type User = SupabaseUser & { is_admin?: boolean }

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error)
          setUser(null)
          setSession(null)
          return
        }

        setSession(session)
        console.log('[Auth] Initial session:', session)

        if (session?.user) {
          try {
            const { data: customer, error: customerError } = await supabase
              .from("customers")
              .select("is_admin")
              .eq("id", session.user.id)
              .single()

            if (customerError) {
              console.error('[Auth] Error fetching customer:', customerError)
              setUser(session.user)
            } else {
              setUser({ ...session.user, is_admin: customer?.is_admin })
            }
          } catch (err) {
            console.error('[Auth] Exception fetching customer:', err)
            setUser(session.user)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('[Auth] Exception in getInitialSession:', err)
        setUser(null)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session)
      setSession(session)

      if (session?.user) {
        try {
          const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("is_admin")
            .eq("id", session.user.id)
            .single()

          if (customerError) {
            console.error('[Auth] Error fetching customer:', customerError)
            setUser(session.user)
          } else {
            setUser({ ...session.user, is_admin: customer?.is_admin })
          }
        } catch (err) {
          console.error('[Auth] Exception fetching customer:', err)
          setUser(session.user)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('[Auth] Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error('[Auth] Error signing in:', error)
        return { error }
      }

      console.log('[Auth] Sign in successful, getting session')
      
      // Wait for the session to be set
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('[Auth] Error getting session after sign in:', sessionError)
        return { error: sessionError }
      }

      if (!session?.user) {
        console.error('[Auth] No user in session after sign in')
        return { error: new Error('No user in session') }
      }

      console.log('[Auth] Session obtained, fetching customer data')
      
      try {
        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .select("is_admin")
          .eq("id", session.user.id)
          .single()

        if (customerError) {
          console.error('[Auth] Error fetching customer:', customerError)
          setUser(session.user)
        } else {
          console.log('[Auth] Customer data fetched successfully')
          setUser({ ...session.user, is_admin: customer?.is_admin })
        }
      } catch (err) {
        console.error('[Auth] Exception fetching customer:', err)
        setUser(session.user)
      }

      return { error: null }
    } catch (err) {
      console.error('[Auth] Exception in signIn:', err)
      return { error: err }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (data.user && !error) {
        const { error: insertError } = await supabase.from("customers").insert({
          id: data.user.id,
          name: name,
          email: email,
        })

        if (insertError) {
          console.error('[Auth] Error creating customer:', insertError)
          return { data, error: insertError }
        }
      }

      return { data, error }
    } catch (err) {
      console.error('[Auth] Exception in signUp:', err)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setSession(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] Error during signOut:', error)
        throw error
      }
      
      // Forzamos un refresh de la página para limpiar cualquier estado residual
      window.location.href = '/'
    } catch (err) {
      console.error('[Auth] Exception during signOut:', err)
      throw err
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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
