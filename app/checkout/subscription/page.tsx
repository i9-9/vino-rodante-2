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
  const [user, setUser] = useState<any>(null)
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
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true)
  const [addressAutoFilled, setAddressAutoFilled] = useState(false)
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
        setIsLoadingUserInfo(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        // Set user state
        setUser(user)
        
        if (user) {
          // Obtener información del cliente de la base de datos
          const { data: customer } = await supabase
            .from('customers')
            .select('name, email')
            .eq('id', user.id)
            .single()

          // Obtener dirección por defecto (o la primera si no hay ninguna marcada como default)
          const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('customer_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)

          const address = addresses?.[0]

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

          // Marcar si se autocompletó la dirección
          if (address?.line1) {
            setAddressAutoFilled(true)
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      } finally {
        setIsLoadingUserInfo(false)
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
      // Validar que tenemos los datos de suscripción
      if (!subscriptionData) {
        throw new Error('No se encontraron los datos de suscripción. Por favor, vuelve a seleccionar un plan.')
      }

      // Validar datos requeridos
      if (!customerInfo.name || !customerInfo.email || !customerInfo.address1 || !customerInfo.city) {
        throw new Error('Por favor completa todos los campos requeridos para la suscripción')
      }

      // Obtener usuario autenticado
      console.log('🔐 Checking user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      // También verificar la sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('👤 User data:', { 
        user: !!user, 
        userId: user?.id,
        userEmail: user?.email,
        authError: !!authError,
        authErrorDetails: authError
      });
      
      console.log('🔑 Session data:', {
        session: !!session,
        sessionError: !!sessionError,
        sessionErrorDetails: sessionError,
        accessToken: session?.access_token ? 'present' : 'missing'
      });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error('Error de autenticación: ' + authError.message)
      }
      
      if (!user) {
        console.error('❌ No user found');
        throw new Error('Debes estar autenticado para crear una suscripción')
      }
      
      console.log('✅ User authenticated successfully:', user.id);

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

      // Verificar si ya existe una dirección idéntica
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('customer_id', user.id)
        .eq('line1', customerInfo.address1)
        .eq('city', customerInfo.city)
        .eq('state', customerInfo.state)
        .eq('postal_code', customerInfo.postalCode)
        .single()

      if (existingAddress) {
        // Actualizar dirección existente
        const { error: addressError } = await supabase
          .from('addresses')
          .update({
            line1: customerInfo.address1,
            line2: customerInfo.address2,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.postalCode,
            country: customerInfo.country,
            is_default: true,
          })
          .eq('id', existingAddress.id)

        if (addressError) {
          console.error('Error updating address:', addressError)
          throw new Error('Error al actualizar dirección')
        }
      } else {
        // Crear nueva dirección
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
      }

      // Asegurar que solo esta dirección sea la principal
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
        .neq('line1', customerInfo.address1)

      // Marcar la dirección actual como principal
      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('customer_id', user.id)
        .eq('line1', customerInfo.address1)

      // Crear suscripción
      const subscriptionPayload = {
        planId: subscriptionData!.planId,
        frequency: subscriptionData!.frequency,
        userId: user.id,
      };
      
      console.log('🚀 Creating subscription with data:', subscriptionPayload);
      console.log('📋 Subscription data details:', {
        planId: subscriptionData!.planId,
        planIdType: typeof subscriptionData!.planId,
        frequency: subscriptionData!.frequency,
        frequencyType: typeof subscriptionData!.frequency,
        userId: user.id,
        userIdType: typeof user.id,
      });

      // Verificación adicional de datos
      if (!subscriptionData!.planId || !subscriptionData!.frequency || !user.id) {
        throw new Error('Datos de suscripción incompletos: ' + JSON.stringify({
          planId: subscriptionData!.planId,
          frequency: subscriptionData!.frequency,
          userId: user.id
        }));
      }

      let response;
      try {
        console.log('🌐 Making API call to /api/subscriptions/create-recurring...');
        console.log('📤 Request payload:', subscriptionPayload);
        console.log('🔗 Request URL:', '/api/subscriptions/create-recurring');
        console.log('📋 Request headers:', {
          'Content-Type': 'application/json',
        });
        
        response = await fetch('/api/subscriptions/create-recurring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionPayload),
        })
        
        console.log('📥 API call completed, response received');
        console.log('📊 Response status:', response.status);
        console.log('📊 Response ok:', response.ok);
      } catch (fetchError) {
        console.error('❌ Fetch error details:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack,
          cause: fetchError.cause
        });
        throw new Error('Error de conexión con el servidor: ' + (fetchError instanceof Error ? fetchError.message : 'Error desconocido'));
      }

      console.log('📊 API Response status:', response.status);
      console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()));

      let result;
      try {
        const responseText = await response.text()
        console.log('📊 Raw response text:', responseText)
        
        if (!responseText) {
          throw new Error('Respuesta vacía del servidor')
        }
        
        result = JSON.parse(responseText)
        console.log('📊 API Response body:', result)
      } catch (parseError) {
        console.error('❌ Error parsing JSON response:', parseError);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        console.error('❌ Response was:', response);
        throw new Error('Error al procesar la respuesta del servidor: ' + (parseError instanceof Error ? parseError.message : 'Error desconocido'))
      }

      if (!response.ok) {
        console.log('❌ API Error - Status:', response.status)
        console.log('❌ API Error - Response:', result)
        const errorMessage = result?.error || `Error del servidor (${response.status})`
        throw new Error(errorMessage)
      }

      // Verificar que tenemos los datos necesarios
      console.log('✅ API call successful, checking response data...')
      console.log('📊 Full result object:', result)
      
      // Validar que result no esté vacío
      if (!result || typeof result !== 'object') {
        console.log('❌ Invalid result object:', result)
        throw new Error('Respuesta inválida del servidor')
      }
      
      console.log('🔗 Payment URL:', result?.paymentUrl)
      console.log('🔗 Init Point:', result?.init_point)
      console.log('🔄 Is Recurring:', result?.isRecurring)
      
      // Redirigir a MercadoPago para completar el pago
      try {
        if (result?.paymentUrl || result?.init_point) {
          setIsRedirecting(true)
          const paymentUrl = result.paymentUrl || result.init_point
          console.log('🚀 Redirecting to MercadoPago for REAL subscription:', paymentUrl)
          
          // Mostrar mensaje de suscripción real
          if (result.isRecurring) {
            console.log('✅ This is a REAL recurring subscription that will auto-renew')
          }
          
          window.location.href = paymentUrl
        } else {
          console.log('❌ No payment URL received in response:', result)
          throw new Error('No se recibió URL de pago de MercadoPago en la respuesta')
        }
      } catch (redirectError) {
        console.log('❌ Error during redirect:', redirectError)
        throw new Error('Error al redirigir a MercadoPago: ' + redirectError.message)
      }
    } catch (error: any) {
      console.error('❌ Error creating subscription:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Mostrar error más específico al usuario
      let errorMessage = 'Error al crear la suscripción'
      if (error.message) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = 'Error desconocido al procesar la suscripción'
      }
      
      setError(errorMessage)
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

  // Verificar autenticación antes de mostrar el formulario
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso requerido</h1>
          <p className="text-gray-600 mb-4">Debes estar autenticado para crear una suscripción.</p>
          <Button onClick={() => router.push('/auth/sign-in')}>
            Iniciar Sesión
          </Button>
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
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>🔄 Suscripción Recurrente:</strong> Esta es una suscripción real que se renovará automáticamente en MercadoPago. 
                      Podrás pausar o cancelar en cualquier momento desde tu cuenta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            {!isRedirecting && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Información de Entrega
                    {isLoadingUserInfo && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-wine-600"></div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUserInfo ? (
                    <div className="space-y-4">
                      <div className="animate-pulse space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="h-10 bg-gray-200 rounded"></div>
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="h-10 bg-gray-200 rounded"></div>
                          <div className="h-10 bg-gray-200 rounded"></div>
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        Cargando información de tu cuenta...
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInfo} className="space-y-4">
                      {addressAutoFilled && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800">
                            ✅ Se ha autocompletado tu dirección principal. Puedes modificarla si es necesario.
                          </p>
                        </div>
                      )}
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
                      className="w-full bg-[#A83935] hover:bg-[#8B2D2A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={isSubmitting || isRedirecting || !subscriptionData}
                    >
                      {isSubmitting ? 'Procesando...' : isRedirecting ? 'Redirigiendo...' : 'Continuar al Pago'}
                    </Button>
                    </form>
                  )}
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
