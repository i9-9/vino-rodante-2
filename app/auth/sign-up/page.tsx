"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/providers/auth-provider"
import { Wine, Check, X } from "lucide-react"

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })
  const [formTouched, setFormTouched] = useState(false)
  
  useEffect(() => {
    if (password) {
      setPasswordStrength({
        hasMinLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[^A-Za-z0-9]/.test(password),
      })
    }
  }, [password])
  
  const isPasswordValid = Object.values(passwordStrength).filter(Boolean).length >= 4
  const passwordsMatch = password === confirmPassword
  const isFormValid = name && email && password && isPasswordValid && passwordsMatch

  const handleInputChange = () => {
    if (!formTouched) setFormTouched(true);
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormTouched(true)
    
    if (!isFormValid) {
      if (!passwordsMatch) {
        setError("Passwords don't match");
      } else if (!isPasswordValid) {
        setError("Password doesn't meet the requirements");
      } else {
        setError("Please fill out all required fields");
      }
      return;
    }
    
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signUp(email, password, name)
      if (error) {
        setError(error.message)
      } else {
        router.push("/auth/sign-up-success")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center text-center">
          <Wine className="h-12 w-12 text-[#5B0E2D]" />
          <h1 className="mt-4 text-3xl font-bold text-[#5B0E2D]">Create an account</h1>
          <p className="mt-2 text-gray-600">Join Vino Rodante to explore our exceptional wine collection</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleInputChange();
                }}
                className="mt-1"
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange();
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleInputChange();
                }}
                className="mt-1"
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
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  handleInputChange();
                }}
                className="mt-1"
              />
              {formTouched && confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white" 
            disabled={isLoading || (formTouched && !isFormValid)}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-[#A83935] hover:text-[#A83935]/80">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
