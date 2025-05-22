"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      const supabase = createClient()
      // Esto refresca la sesión si hay un token en la URL
      const { error } = await supabase.auth.getSession()
      if (!error) {
        router.replace("/account")
      } else {
        router.replace("/auth/login?error=callback")
      }
    }
    handleAuth()
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Procesando autenticación...</p>
    </div>
  )
} 