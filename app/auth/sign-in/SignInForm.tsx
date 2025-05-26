'use client'

import { signInAction } from "./actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wine } from "lucide-react"
import Spinner from "@/components/ui/Spinner"
import { useState } from "react"

export default function SignInForm({ error, returnTo }: { error?: string; returnTo?: string }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (returnTo) {
      formData.append('return_to', returnTo)
    }

    try {
      await signInAction(formData)
    } catch (err) {
      console.error('Error during sign in:', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="flex flex-col items-center text-center">
        <Wine className="h-12 w-12 text-[#5B0E2D]" />
        <h1 className="mt-4 text-3xl font-bold text-[#5B0E2D]">Iniciar sesión</h1>
        <p className="mt-2 text-gray-600">Bienvenido de nuevo a Vino Rodante</p>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <form
        className="mt-8 space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/auth/reset-password"
                className="text-sm font-medium text-[#A83935] hover:text-[#A83935]/80"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white" disabled={submitting}>
          {submitting ? <Spinner size={24} /> : "Iniciar sesión"}
        </Button>
        <div className="text-center text-sm">
          ¿No tienes cuenta? {" "}
          <Link href="/auth/sign-up" className="font-medium text-[#A83935] hover:text-[#A83935]/80">
            Crear cuenta
          </Link>
        </div>
      </form>
    </div>
  )
} 