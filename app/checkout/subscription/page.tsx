"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, Wine, Calendar, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SubscriptionData {
  planId: string
  frequency: string
  price: number
  bottles: number
  label: string
}

export default function SubscriptionCheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Argentina",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Obtener datos de suscripción del sessionStorage
    const storedData = sessionStorage.getItem('subscriptionData')
    if (!storedData) {
      router.push('/weekly-wine')
      return
    }

    try {
      const data = JSON.parse(storedData)
      setSubscriptionData(data)
    } catch (error) {
      console.error('Error parsing subscription data:', error)
      router.push('/weekly-wine')
    }
  }, [router])

  // Autocompletar información del usuario logueado
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Obtener información del cliente de la base de datos
          const { data: customer } = await supabase
            .from('customers')
            .select('name, email')
            .eq('id', user.id)
            .single()

          // Obtener dirección por defecto
          const { data: address } = await supabase
            .from('addresses')
            .select('*')
            .eq('customer_id', user.id)
            .eq('is_default', true)
            .single()

          // Prellenar información del cliente
          setCustomerInfo(prev => ({
            ...prev,
            name: customer?.name || user.user_metadata?.name || prev.name,
            email: customer?.email || user.email || prev.email,
            phone: user.user_metadata?.phone || prev.phone,
            address1: address?.line1 || prev.address1,
            address2: address?.line2 || prev.address2,
            city: address?.city || prev.city,
            state: address?.state || prev.state,
            postalCode: address?.postal_code || prev.postalCode,
            country: address?.country || 'Argentina',
          }))
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    fetchUserInfo()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validar datos requeridos
      if (!customerInfo.name || !customerInfo.email || !customerInfo.address1 || !customerInfo.city) {
        throw new Error('Por favor completa todos los campos requeridos para la suscripción')
      }

      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Debes estar autenticado para crear una suscripción')
      }

      // Primero guardar información del cliente
      const { error: customerError } = await supabase.from("customers").upsert({
        id: user.id,
        name: customerInfo.name,
        email: customerInfo.email,
      })

      if (customerError) {
        console.error('Error saving customer:', customerError)
        throw new Error('Error al guardar información del cliente')
      }

      // Crear dirección
      const { error: addressError } = await supabase.from("addresses").insert({
        customer_id: user.id,
        line1: customerInfo.address1,
        line2: customerInfo.address2,
        city: customerInfo.city,
        state: customerInfo.state,
        postal_code: customerInfo.postalCode,
        country: customerInfo.country,
        is_default: true,
      })

      if (addressError) {
        console.error('Error saving address:', addressError)
        throw new Error('Error al guardar dirección')
      }

      // Crear suscripción recurrente
      const response = await fetch('/api/subscriptions/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: subscriptionData!.planId,
          frequency: subscriptionData!.frequency,
          userId: user.id,
        }),
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (!response.ok) {
        console.error('API Error:', result)
        throw new Error(result.error || 'Error al crear la suscripción')
      }

      // Redirigir a MercadoPago para completar el pago
      console.log('Payment URL:', result.paymentUrl)
      console.log('Init Point:', result.init_point)
      
      if (result.paymentUrl || result.init_point) {
        setIsRedirecting(true)
        const paymentUrl = result.paymentUrl || result.init_point
        console.log('Redirecting to:', paymentUrl)
        window.location.href = paymentUrl
      } else {
        console.error('No payment URL received:', result)
        throw new Error('No se recibió URL de pago de MercadoPago')
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error)
      setError(error.message || 'Error al crear la suscripción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSuccess = () => {
    // Limpiar datos de suscripción del sessionStorage
    sessionStorage.removeItem('subscriptionData')
    // Redirigir a confirmación
    router.push('/account/subscriptions?status=success')
  }

  const onError = (errorMessage: string) => {
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })
    setStep("info")
  }

  if (!subscriptionData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 bg-wine-600 rounded-full mx-auto mb-4"></div>
            <p className="text-wine-800">Cargando información de suscripción...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link 
            href="/weekly-wine" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Weekly Wine
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout - Suscripción</h1>
          <p className="text-gray-600">Completa tu información para activar tu suscripción</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de la suscripción */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wine className="h-5 w-5 text-wine-600" />
                  Resumen de Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plan:</span>
                  <span>{subscriptionData.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Frecuencia:</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {subscriptionData.frequency === 'weekly' ? 'Semanal' : 
                     subscriptionData.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Botellas por entrega:</span>
                  <span>{subscriptionData.bottles}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Precio:</span>
                    <span className="text-wine-600">{formatCurrency(subscriptionData.price)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Se debitará automáticamente cada {subscriptionData.frequency === 'weekly' ? 'semana' : 
                    subscriptionData.frequency === 'biweekly' ? '2 semanas' : 'mes'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            {!isRedirecting && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitInfo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address1">Dirección *</Label>
                      <Input
                        id="address1"
                        name="address1"
                        value={customerInfo.address1}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2">Dirección 2 (opcional)</Label>
                      <Input
                        id="address2"
                        name="address2"
                        value={customerInfo.address2}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={customerInfo.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Provincia</Label>
                        <Input
                          id="state"
                          name="state"
                          value={customerInfo.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Código Postal</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={customerInfo.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-wine-600 hover:bg-wine-700"
                      disabled={isSubmitting || isRedirecting}
                    >
                      {isSubmitting ? 'Procesando...' : isRedirecting ? 'Redirigiendo...' : 'Continuar al Pago'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Estado de redirección */}
            {isRedirecting && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-wine-600" />
                    Redirigiendo a MercadoPago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-wine-600 mx-auto"></div>
                    <h3 className="text-lg font-semibold">Redirigiendo a MercadoPago...</h3>
                    <p className="text-gray-600">
                      Serás redirigido a MercadoPago para completar el pago de tu suscripción.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Tu suscripción se renovará automáticamente cada {subscriptionData.frequency === 'weekly' ? 'semana' : 
                        subscriptionData.frequency === 'biweekly' ? '2 semanas' : 'mes'} hasta que la canceles.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Beneficios de tu Suscripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Entrega automática</p>
                    <p className="text-sm text-gray-600">Recibe tus vinos sin preocuparte por reordenar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Selección experta</p>
                    <p className="text-sm text-gray-600">Vinos cuidadosamente seleccionados por sommeliers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Flexibilidad total</p>
                    <p className="text-sm text-gray-600">Pausa o cancela cuando quieras</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Envío gratis</p>
                    <p className="text-sm text-gray-600">En CABA y GBA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
