"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { AuthContextType, AuthError, AuthLoadingState, User } from "@/lib/types/auth"
import { createClient } from '@/lib/supabase/client'

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

  // Estados de control mejorados
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Fase 1: Detectar que estamos en el cliente
  useEffect(() => {
    console.log('🔐 AuthProvider: Client Detection', {
      timestamp: new Date().toISOString(),
      stage: 'client-detection-start'
    });
    setIsClient(true);
    console.log('🔐 AuthProvider: Client Detected', {
      timestamp: new Date().toISOString(),
      stage: 'client-detection-complete'
    });
  }, []);

  // Fase 2: Inicializar auth solo cuando el cliente está listo
  useEffect(() => {
    if (!isClient) {
      console.log('🔐 AuthProvider: Waiting for client', {
        timestamp: new Date().toISOString(),
        stage: 'waiting-for-client'
      });
      return;
    }
    
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthProvider: Initialization Start', {
          timestamp: new Date().toISOString(),
          isClient,
          isMounted,
          isInitialized,
          stage: 'init-start'
        });
        
        // Obtener el estado inicial de autenticación
        const supabase = createClient();
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (isMounted) {
          console.log('🔐 AuthProvider: Initial Session Check', {
            timestamp: new Date().toISOString(),
            hasSession: !!initialSession,
            userId: initialSession?.user?.id,
            stage: 'session-check'
          });

          // Actualizar el estado con la sesión inicial
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Marcar como inicializado DESPUÉS de obtener la sesión inicial
          console.log('🔐 AuthProvider: Setting Initialized State', {
            timestamp: new Date().toISOString(),
            stage: 'setting-initialized'
          });
          setIsInitialized(true);
          setInitError(null);
          setIsLoading(prev => ({ ...prev, isInitializing: false }));
          console.log('✅ AuthProvider: Initialization Complete', {
            timestamp: new Date().toISOString(),
            stage: 'init-complete'
          });
        }
      } catch (error: any) {
        console.error('❌ AuthProvider: Initialization Error', {
          timestamp: new Date().toISOString(),
          error: error.message,
          stage: 'init-error'
        });
        if (isMounted) {
          setInitError(error.message);
          setIsInitialized(true); // IMPORTANTE: marcar como inicializado incluso con error
          setIsLoading(prev => ({ ...prev, isInitializing: false }));
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🔐 AuthProvider: Cleanup', {
        timestamp: new Date().toISOString(),
        stage: 'cleanup'
      });
      isMounted = false;
    };
  }, [isClient]);

  // LOG adicional para monitorear el estado
  useEffect(() => {
    console.log('🔐 AuthProvider: State Change', { 
      timestamp: new Date().toISOString(),
      isInitialized, 
      initError, 
      isClient,
      hasUser: !!user,
      isLoading,
      stage: 'state-change'
    });
  }, [isInitialized, initError, isClient, user, isLoading]);

  // Fase 3: Suscribirse a cambios de auth solo cuando está inicializado
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔐 AuthProvider: Waiting for initialization', {
        timestamp: new Date().toISOString(),
        stage: 'waiting-for-init'
      });
      return;
    }

    console.log('🔐 AuthProvider: Setting up auth subscription', {
      timestamp: new Date().toISOString(),
      stage: 'subscription-setup'
    });

    const supabase = createClient();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider: Auth State Change', {
        timestamp: new Date().toISOString(),
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        stage: 'auth-state-change'
      });
      
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth subscription', {
        timestamp: new Date().toISOString(),
        stage: 'subscription-cleanup'
      });
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(prev => ({ ...prev, isSigningIn: true }))
      console.log('[Auth] Attempting sign in for:', email)
      
      const supabase = createClient();
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
      
      const supabase = createClient();
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
      
      const supabase = createClient();
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isInitialized,
        initError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
