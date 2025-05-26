"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleAuth() {
      const supabase = createClient()
      try {
        // Check for error in URL parameters
        const errorParam = searchParams.get('error')
        if (errorParam) {
          console.error('[Auth] Callback error from URL:', errorParam)
          setError(errorParam)
          router.replace(`/auth/sign-in?error=${encodeURIComponent(errorParam)}`)
          return
        }

        // Check for code in URL parameters
        const code = searchParams.get('code')
        if (!code) {
          console.error('[Auth] No code found in URL')
          setError('No authentication code found')
          router.replace('/auth/sign-in?error=no_code')
          return
        }

        // Exchange the code for a session
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
        if (sessionError) {
          console.error('[Auth] Error exchanging code for session:', sessionError)
          setError(sessionError.message)
          router.replace(`/auth/sign-in?error=${encodeURIComponent(sessionError.message)}`)
          return
        }

        // Get the session to verify it was created
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()
        if (getSessionError || !session) {
          console.error('[Auth] Error getting session after code exchange:', getSessionError)
          setError(getSessionError?.message || 'No session found after authentication')
          router.replace('/auth/sign-in?error=no_session')
          return
        }

        // Success - redirect to account page
        console.log('[Auth] Authentication successful, redirecting to account page')
        router.replace('/account')
      } catch (err) {
        console.error('[Auth] Unexpected error in callback:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        router.replace('/auth/sign-in?error=unexpected')
      }
    }

    handleAuth()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Error: {error}</p>
        <p>Redirecting to sign in page...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p>Procesando autenticación...</p>
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
} 