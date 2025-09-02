"use client"

import { signUpAction } from "../actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Spinner from "@/components/ui/Spinner"
import { Wine, Check, X } from "lucide-react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function SignUpForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const success = searchParams.get("success")
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formTouched, setFormTouched] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (!formTouched) setFormTouched(true)
    if (e.target.name === 'password') {
      const password = e.target.value
      setPasswordStrength({
        hasMinLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[^A-Za-z0-9]/.test(password),
      })
    }
  }
  const isPasswordValid = Object.values(passwordStrength).filter(Boolean).length >= 4
  const passwordsMatch = form.password === form.confirmPassword
  const isFormValid = form.name && form.email && form.password && isPasswordValid && passwordsMatch
  const renderPasswordRequirement = (label: string, met: boolean) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      )}
      <span className={met ? "text-green-600" : "text-gray-500"}>{label}</span>
    </div>
  );
  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="flex flex-col items-center text-center">
        <Wine className="h-12 w-12 text-[#5B0E2D]" />
        <h1 className="mt-4 text-3xl font-bold text-[#5B0E2D]">Create an account</h1>
        <p className="mt-2 text-gray-600">Join Vino Rodante to explore our exceptional wine collection</p>
      </div>
      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      <form className="mt-8 space-y-6" action={signUpAction} onSubmit={() => setSubmitting(true)}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleInputChange}
              className="mt-1"
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="email">Email address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleInputChange}
              className="mt-1"
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleInputChange}
              className="mt-1"
              disabled={submitting}
              placeholder="Ej: +54 9 11 1234-5678"
            />
            <p className="text-sm text-gray-600 mt-1">Opcional - Te contactaremos para coordinar entregas</p>
          </div>
          <div>
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleInputChange}
              className="mt-1"
              disabled={submitting}
            />
            <div className="mt-2 space-y-1.5">
              {renderPasswordRequirement("At least 8 characters", passwordStrength.hasMinLength)}
              {renderPasswordRequirement("At least 1 uppercase letter", passwordStrength.hasUppercase)}
              {renderPasswordRequirement("At least 1 lowercase letter", passwordStrength.hasLowercase)}
              {renderPasswordRequirement("At least 1 number", passwordStrength.hasNumber)}
              {renderPasswordRequirement("At least 1 special character", passwordStrength.hasSpecialChar)}
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleInputChange}
              className="mt-1"
              disabled={submitting}
            />
            {formTouched && form.confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
          disabled={submitting || (formTouched && !isFormValid)}
        >
          {submitting ? <Spinner size={24} /> : "Create account"}
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-medium text-[#A83935] hover:text-[#A83935]/80">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function SignUp() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <Suspense fallback={<div>Cargando...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
