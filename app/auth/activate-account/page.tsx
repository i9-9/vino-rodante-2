"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/components/ui/use-toast"

export default function ActivateAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isActivated, setIsActivated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Pre-fill email from URL params if available
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Try to sign in with the temporary password first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: password, // This will be the new password they want to set
      })

      if (signInError) {
        // If sign in fails, try to update the password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (updateError) {
          throw new Error(`Error al activar la cuenta: ${updateError.message}`)
        }
      }

      // Update user metadata if needed
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          account_activated: true,
          activation_date: new Date().toISOString()
        }
      })

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError)
      }

      setIsActivated(true)
      
      toast({
        title: "¡Cuenta activada!",
        description: "Tu cuenta ha sido activada exitosamente",
      })

      // Redirect to account page after a short delay
      setTimeout(() => {
        router.push('/account')
      }, 2000)

    } catch (error: any) {
      console.error('Error activating account:', error)
      toast({
        title: "Error",
        description: error.message || "Error al activar la cuenta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialActivation = () => {
    // Redirect to sign in with social providers
    router.push('/auth/sign-in?social=true&activate=true')
  }

  if (isActivated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡Cuenta activada!
                </h2>
                <p className="text-gray-600">
                  Tu cuenta ha sido activada exitosamente. Serás redirigido a tu panel de cuenta.
                </p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wine-600 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Activar tu cuenta
          </h1>
          <p className="text-gray-600">
            Completa la información para activar tu cuenta de Vino Rodante
          </p>
        </div>

        {/* Activation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-wine-600" />
              Configurar tu cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivateAccount} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!searchParams.get('email')}
                />
              </div>

              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-wine-600 hover:bg-wine-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Activando cuenta...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Activar cuenta
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O activa con
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSocialActivation}
                variant="outline" 
                className="w-full mt-4"
              >
                <Mail className="h-4 w-4 mr-2" />
                Google / Apple
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/sign-in" className="text-wine-600 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">
              Beneficios de tu cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Historial completo de compras</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Gestión de suscripciones</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Ofertas exclusivas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Compras más rápidas</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
