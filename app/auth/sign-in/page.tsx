"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/providers/auth-provider"
import { Wine } from "lucide-react"
import { useTranslations } from "@/lib/providers/translations-provider"

export default function SignIn() {
  const router = useRouter()
  const auth = useAuth()
  const { signIn, user, isLoading: authLoading, session } = auth
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }
    } catch (err) {
      console.error('[SignIn] Exception:', err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/")
    }
  }, [user, authLoading, router])

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center text-center">
          <Wine className="h-12 w-12 text-[#5B0E2D]" />
          <h1 className="mt-4 text-3xl font-bold text-[#5B0E2D]">{t.auth.signIn.title || "Iniciar sesión"}</h1>
          <p className="mt-2 text-gray-600">{t.auth.signIn.subtitle || "Bienvenido de nuevo a Vino Rodante"}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-sm font-medium text-[#A83935] hover:text-[#A83935]/80"
                >
                  {t.auth.signIn.forgotPassword || "¿Olvidaste tu contraseña?"}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white" 
            disabled={isLoading}
          >
            {isLoading ? t.common.loading || "Ingresando..." : t.auth.signIn.title || "Iniciar sesión"}
          </Button>

          <div className="text-center text-sm">
            {t.auth.signIn.noAccount || "¿No tienes cuenta?"} {" "}
            <Link href="/auth/sign-up" className="font-medium text-[#A83935] hover:text-[#A83935]/80">
              {t.auth.signIn.createAccount || "Crear cuenta"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
