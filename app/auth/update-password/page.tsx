"use client"

import { useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/providers/translations-provider"

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
      setError("Ocurrió un error inesperado. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.auth.updatePasswordTitle || "Establecer nueva contraseña"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder={t.auth.newPassword || "Nueva contraseña"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t.auth.confirmPassword || "Confirmar contraseña"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.common.loading || "Guardando..." : t.auth.savePassword || "Guardar contraseña"}
            </Button>
            {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 