"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Wine, Mail, Lock, ArrowRight, Gift } from "lucide-react"
import Link from "next/link"
import { createClient } from '@/utils/supabase/client'

interface OrderData {
  id: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  created_at: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

interface SubscriptionData {
  id: string
  planName: string
  frequency: string
  status: string
  next_delivery_date: string
  customerEmail?: string
  customerName?: string
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setIsLoading(true)
        
        // Verificar si hay parámetros de MercadoPago
        const paymentId = searchParams.get('payment_id')
        const status = searchParams.get('status')
        const externalReference = searchParams.get('external_reference')
        
        console.log('Payment params:', { paymentId, status, externalReference })

        if (paymentId && status === 'approved') {
          // Buscar la orden o suscripción por external_reference
          if (externalReference) {
            const [userId, planId, frequency] = externalReference.split('_')
            
            if (planId && frequency) {
              // Es una suscripción
              const { data: subscription } = await supabase
                .from('user_subscriptions')
                .select(`
                  id,
                  status,
                  next_delivery_date,
                  subscription_plans!inner(name),
                  customers!inner(name, email)
                `)
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .eq('frequency', frequency)
                .single()

              if (subscription) {
                setSubscriptionData({
                  id: subscription.id,
                  planName: subscription.subscription_plans.name,
                  frequency: frequency,
                  status: subscription.status,
                  next_delivery_date: subscription.next_delivery_date,
                  customerName: subscription.customers.name,
                  customerEmail: subscription.customers.email
                })
              }
            } else {
              // Es una orden individual
              const { data: order } = await supabase
                .from('orders')
                .select(`
                  id,
                  total,
                  status,
                  created_at,
                  customers!inner(name, email)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

              if (order) {
                setOrderData({
                  id: order.id,
                  customerName: order.customers.name,
                  customerEmail: order.customers.email,
                  total: order.total,
                  status: order.status,
                  created_at: order.created_at
                })
              }
            }

            // Verificar si es un usuario invitado (sin autenticación)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
              setIsGuest(true)
            }
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams, supabase])

  const handleCreateAccount = async () => {
    if (!orderData && !subscriptionData) return

    setIsCreatingAccount(true)
    
    try {
      const email = orderData?.customerEmail || subscriptionData?.customerEmail
      const name = orderData?.customerName || subscriptionData?.customerName
      
      if (!email || !name) {
        throw new Error('Información del cliente no encontrada')
      }

      // Crear cuenta con contraseña temporal
      const tempPassword = `VinoRodante${Math.random().toString(36).slice(-8)}!`
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            name,
          }
        }
      })

      if (authError) {
        throw new Error(`Error al crear cuenta: ${authError.message}`)
      }

      // Enviar email con información de la cuenta
      const response = await fetch('/api/auth/send-account-created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password: tempPassword,
          isTemporaryEmail: false
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar email de confirmación')
      }

      // Redirigir al login
      router.push('/auth/sign-in?message=account-created')
      
    } catch (error) {
      console.error('Error creating account:', error)
      alert('Error al crear la cuenta. Por favor, intenta más tarde.')
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleSocialLogin = () => {
    // Redirigir a login con opciones sociales
    router.push('/auth/sign-in?social=true')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 bg-wine-600 rounded-full mx-auto mb-4"></div>
            <p className="text-wine-800">Verificando tu compra...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {subscriptionData ? '¡Suscripción activada!' : '¡Compra confirmada!'}
          </h1>
          <p className="text-gray-600">
            {subscriptionData 
              ? 'Tu suscripción ha sido activada exitosamente' 
              : 'Tu pago ha sido procesado exitosamente'
            }
          </p>
        </div>

        {/* Información de la compra */}
        {(orderData || subscriptionData) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wine className="h-5 w-5 text-wine-600" />
                Detalles de tu compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de orden:</span>
                    <span className="font-medium">#{orderData.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">${orderData.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-green-600 capitalize">{orderData.status}</span>
                  </div>
                </div>
              )}

              {subscriptionData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{subscriptionData.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="font-medium capitalize">
                      {subscriptionData.frequency === 'weekly' ? 'Semanal' : 
                       subscriptionData.frequency === 'biweekly' ? 'Quincenal' : 
                       subscriptionData.frequency === 'monthly' ? 'Mensual' : 'Trimestral'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Próxima entrega:</span>
                    <span className="font-medium">
                      {new Date(subscriptionData.next_delivery_date).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-green-600 capitalize">
                      {subscriptionData.status === 'active' ? 'Activa' : subscriptionData.status}
                    </span>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>🔄 Suscripción Recurrente:</strong> Tu suscripción se renovará automáticamente. 
                      Puedes pausar o cancelar en cualquier momento desde tu cuenta.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sección de activación de cuenta para invitados */}
        {isGuest && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Gift className="h-5 w-5" />
                ¡Creemos tu cuenta!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-700">
                Con los datos de tu compra ya creamos tu cuenta para que puedas:
              </p>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Seguir el estado de tus pedidos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Gestionar tus suscripciones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Comprar más rápido la próxima vez
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Acceder a ofertas exclusivas
                </li>
              </ul>
              
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreatingAccount ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Crear cuenta con contraseña
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleSocialLogin}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Activar con Google/Apple
                </Button>
              </div>
              
              <p className="text-sm text-blue-600 text-center">
                También recibirás un email con un link mágico para activar tu cuenta
              </p>
            </CardContent>
          </Card>
        )}

        {/* Acciones adicionales */}
        <div className="space-y-4">
          <Button 
            asChild 
            className="w-full bg-wine-600 hover:bg-wine-700 text-white"
          >
            <Link href="/account">
              <ArrowRight className="h-4 w-4 mr-2" />
              Ir a mi cuenta
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            className="w-full"
          >
            <Link href="/">
              Continuar comprando
            </Link>
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            ¿Tienes alguna pregunta? Contáctanos en{' '}
            <a href="mailto:info@vinorodante.com" className="text-wine-600 hover:underline">
              info@vinorodante.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
