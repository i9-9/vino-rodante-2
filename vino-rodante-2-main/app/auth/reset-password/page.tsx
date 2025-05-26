"use client"

import { resetPasswordAction } from "../actions"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Spinner from "@/components/ui/Spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wine } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const success = searchParams.get("success")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex flex-col items-center text-center">
          <Wine className="h-12 w-12 text-[#5B0E2D]" />
          <CardTitle className="mt-4 text-2xl">Recuperar contraseña</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <form
          action={resetPasswordAction}
          onSubmit={() => setSubmitting(true)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
            disabled={submitting}
          >
            {submitting ? <Spinner size={24} /> : "Enviar instrucciones"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
} 