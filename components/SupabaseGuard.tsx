"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/providers/auth-provider"
import Spinner from "@/components/ui/Spinner"

interface SupabaseGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const DefaultFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-center">
          <div className="mb-4">
            <Spinner size={32} />
          </div>
        <p className="text-wine-800">Inicializando cuenta...</p>
      </div>
    </div>
  </div>
)

export default function SupabaseGuard({ children, fallback = <DefaultFallback /> }: SupabaseGuardProps) {
  const { user, isInitialized, initError } = useAuth()
  const router = useRouter()
  const [forceReady, setForceReady] = useState(false)

  // Timeout de seguridad
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⚠️ SupabaseGuard: Timeout alcanzado, forzando carga', {
        timestamp: new Date().toISOString(),
        wasInitialized: isInitialized,
        hasUser: !!user,
        hasError: !!initError,
        stage: 'timeout-force-ready'
      });
      setForceReady(true);
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, [isInitialized, user, initError]);

  useEffect(() => {
    console.log('🛡️ SupabaseGuard Debug:', {
      timestamp: new Date().toISOString(),
      isInitialized,
      hasUser: !!user,
      initError,
      forceReady,
      stage: 'auth-check'
    });

    if ((isInitialized || forceReady) && !user) {
      console.log('🛡️ SupabaseGuard Redirect:', {
        timestamp: new Date().toISOString(),
        reason: 'No authenticated user',
        wasForced: forceReady,
        redirectTo: '/auth/sign-in'
      });
      router.replace('/auth/sign-in?return_to=/account')
    }
  }, [user, isInitialized, router, forceReady]);

  // Show fallback while initializing
  if (!isInitialized && !forceReady) {
    console.log('🛡️ SupabaseGuard Loading:', {
      timestamp: new Date().toISOString(),
      hasFallback: true,
      stage: 'loading'
    });
    return fallback
  }

  // Show error state
  if (initError) {
    console.log('🛡️ SupabaseGuard Error:', {
      timestamp: new Date().toISOString(),
      error: initError,
      stage: 'error'
    });
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al inicializar la autenticación: {initError}</p>
        </div>
      </div>
    )
  }

  // Show children if authenticated or forced ready
  if (user || forceReady) {
    console.log('🛡️ SupabaseGuard Render:', {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      wasForced: forceReady,
      stage: 'render-children'
    });
    return children
  }

  // Show fallback while redirecting
  console.log('🛡️ SupabaseGuard Pre-redirect:', {
    timestamp: new Date().toISOString(),
    hasFallback: true,
    wasForced: forceReady,
    stage: 'pre-redirect'
  });
  return fallback
} 