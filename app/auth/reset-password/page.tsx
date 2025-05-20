"use client"

import { useState } from "react"
import { createClient } from '@/lib/supabase/server'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "@/lib/providers/translations-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wine } from "lucide-react"

export default function ResetPasswordPage() {
  const t = useTranslations()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage(t.auth.resetPasswordEmailSent || "Te enviamos un email para restaurar tu contraseña.")
      }
    } catch (err) {
      console.error('[ResetPassword] Exception:', err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center text-center">
            <Wine className="h-12 w-12 text-[#5B0E2D]" />
            <CardTitle className="mt-4 text-2xl">Recuperar contraseña</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 