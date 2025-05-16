"use client"

import { useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/providers/translations-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wine } from "lucide-react"

export default function UpdatePasswordPage() {
  const t = useTranslations()
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        if (error.status === 422) {
          setError("El enlace de recuperación ha expirado o es inválido. Por favor, solicita uno nuevo.")
        } else {
          setError(error.message)
        }
      } else {
        setMessage("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.")
        setTimeout(() => router.push("/auth/sign-in"), 2000)
      }
    } catch (err) {
      console.error('[UpdatePassword] Exception:', err)
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado. Intenta nuevamente.")
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
            <CardTitle className="mt-4 text-2xl">Actualizar contraseña</CardTitle>
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
                id="password"
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                id="confirm"
                type="password"
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 