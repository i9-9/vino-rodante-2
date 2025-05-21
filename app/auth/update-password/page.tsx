"use client"

import { updatePasswordAction } from "../actions"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Spinner from "@/components/ui/Spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wine } from "lucide-react"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const success = searchParams.get("success")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)

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
            action={updatePasswordAction}
            onSubmit={() => setSubmitting(true)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
              <Input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
              disabled={submitting}
            >
              {submitting ? <Spinner size={24} /> : "Actualizar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 