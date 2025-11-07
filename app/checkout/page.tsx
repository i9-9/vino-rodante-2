"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/lib/providers/auth-provider"
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from "@/lib/providers/translations-provider"
import { MercadoPagoCheckout } from "@/components/ui/mercado-pago-checkout"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/hooks/use-cart"
import { calculateShipping, getShippingZone } from "@/lib/shipping-utils"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ARGENTINA_PROVINCES } from "@/lib/argentina-provinces"
import { FormInput } from "@/components/ui/form-input"
import { validateEmail, validatePhone, validatePostalCode, validateRequired } from "@/lib/utils/validation"
import { AlertCircle } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()
  const { user, isInitialized, initError } = useAuth()
  const { cartItems, subtotal, totalSavings, finalTotal, clearCart } = useCart()
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
  const [step, setStep] = useState<"info" | "payment">("info")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const supabase = createClient()
  
  const handleFieldChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
    setTouchedFields(prev => ({ ...prev, [field]: true }))
    
    // Validación en tiempo real
    let validationError: string | undefined
    
    switch (field) {
      case 'email':
        const emailValidation = validateEmail(value)
        if (!emailValidation.isValid) {
          validationError = emailValidation.message
        }
        break
      case 'phone':
        const phoneValidation = validatePhone(value, true)
        if (!phoneValidation.isValid) {
          validationError = phoneValidation.message
        }
        break
      case 'postalCode':
        const postalValidation = validatePostalCode(value, true)
        if (!postalValidation.isValid) {
          validationError = postalValidation.message
        }
        break
      case 'name':
      case 'address1':
      case 'city':
        const requiredValidation = validateRequired(value, field === 'name' ? 'El nombre' : field === 'address1' ? 'La dirección' : 'La ciudad')
        if (!requiredValidation.isValid) {
          validationError = requiredValidation.message
        }
        break
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: validationError || ''
    }))
  }
  
  const isFormValid = () => {
    return (
      customerInfo.name &&
      customerInfo.email &&
      customerInfo.phone &&
      customerInfo.address1 &&
      customerInfo.city &&
      customerInfo.state &&
      customerInfo.postalCode &&
      !fieldErrors.name &&
      !fieldErrors.email &&
      !fieldErrors.phone &&
      !fieldErrors.address1 &&
      !fieldErrors.city &&
      !fieldErrors.postalCode
    )
  }

  // Prefill from authenticated user metadata fast, before DB fetch completes
  useEffect(() => {
    if (user && isInitialized) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: prev.name || (user.user_metadata?.name ?? ""),
        email: user.email ?? prev.email,
      }))
    }
  }, [user, isInitialized])

  const allFreeShipping = cartItems.length > 0 && cartItems.every((it) => (it as any).free_shipping === true)
  // Calcular envío basado en código postal si está disponible
  const shipping = allFreeShipping ? 0 : calculateShipping(customerInfo.postalCode, 15000)
  const total = finalTotal + shipping
  
  // Obtener información de la zona de envío para mostrar al usuario
  const shippingZone = getShippingZone(customerInfo.postalCode)

  useEffect(() => {
    console.log("Checkout useEffect triggered:", {
      isInitialized,
      user: !!user,
      userEmail: user?.email,
      cartItemsLength: cartItems.length,
      step
    })

    // Redirect if cart is empty
    if (cartItems.length === 0) {
      console.log("Redirecting to products: cart is empty")
      
      // Check if user came from a successful payment (has MercadoPago success parameters)
      const urlParams = new URLSearchParams(window.location.search)
      const hasSuccessParam = urlParams.has('payment_id') || urlParams.has('collection_id') || urlParams.has('collection_status')
      
      if (hasSuccessParam) {
        // If user has payment success params but empty cart, redirect to account
        router.push("/account")
      } else {
        // Normal empty cart redirect to products
        router.push("/products")
      }
      return;
    }

    // If user is logged in and initialized, fetch their information
    if (user && isInitialized) {
      console.log("User authenticated, fetching user info")
      const fetchUserInfo = async () => {
        try {
          const { data, error } = await supabase
            .from("customers")
            .select(`*, addresses(*)`)
            .eq("id", user.id)
            .single()

          if (error) {
            console.error("Error fetching user data:", error)
            return
          }

          if (data) {
            console.log("User data fetched:", data)
            setCustomerInfo((prev) => ({
              ...prev,
              name: data.name || "",
              email: user.email || "",
            }))

            // If user has addresses, use the default one or the first one
            if (data.addresses && data.addresses.length > 0) {
              const defaultAddress = data.addresses.find((addr: any) => addr.is_default) || data.addresses[0]
              console.log("Using address:", defaultAddress)

              setCustomerInfo((prev) => ({
                ...prev,
                address1: defaultAddress.line1 || "",
                address2: defaultAddress.line2 || "",
                city: defaultAddress.city || "",
                state: defaultAddress.state || "",
                postalCode: defaultAddress.postal_code || "",
                country: defaultAddress.country || "Argentina",
              }))
            }
          }
        } catch (error) {
          console.error("Error in fetchUserInfo:", error)
        }
      }

      fetchUserInfo()
    }
  }, [user, isInitialized, router, cartItems.length, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate minimum bottles requirement (only for individual products, not boxes)
    const hasBoxes = cartItems.some(item => item.is_box || item.category === 'Boxes' || item.category === 'boxes')
    
    if (!hasBoxes) {
      const totalBottles = cartItems.reduce((total, item) => total + item.quantity, 0)
      if (totalBottles < 3) {
        const plural = totalBottles === 1 ? '' : 's'
        setError(t.checkout?.minimumBottlesNote?.replace('{count}', totalBottles.toString()).replace('{plural}', plural) || `Para compras individuales, el mínimo es de 3 botellas. Actualmente tienes ${totalBottles} botella${plural}.`)
        setIsSubmitting(false)
        return
      }
    }

    // Validar formulario antes de enviar
    if (!isFormValid()) {
      // Marcar todos los campos como touched para mostrar errores
      setTouchedFields({
        name: true,
        email: true,
        phone: true,
        address1: true,
        city: true,
        state: true,
        postalCode: true,
      })
      setError("Por favor completa todos los campos requeridos correctamente")
      setIsSubmitting(false)
      return
    }

    try {
      let customerId = user?.id

      // If user is not authenticated, create account automatically
      if (!user) {
        console.log("Creating account for guest user")
        
        // Create user account with email and password
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: customerInfo.email,
          password: `temp_${Date.now()}`, // Temporary password
          options: {
            data: {
              name: customerInfo.name,
            }
          }
        })

        if (authError) {
          // If user already exists, try to sign in
          if (authError.message.includes('already registered')) {
            console.log("User already exists, trying to sign in")
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: customerInfo.email,
              password: `temp_${Date.now()}`,
            })
            
            if (signInError) {
              // If sign in fails, create a new account with different email
              const tempEmail = `guest_${Date.now()}@vinorodante.com`
              const { data: newAuthData, error: newAuthError } = await supabase.auth.signUp({
                email: tempEmail,
                password: `temp_${Date.now()}`,
                options: {
                  data: {
                    name: customerInfo.name,
                  }
                }
              })
              
              if (newAuthError) {
                throw new Error("Error creating guest account")
              }
              
              customerId = newAuthData.user?.id
            } else {
              customerId = signInData.user?.id
            }
          } else {
            throw new Error("Error creating account")
          }
        } else {
          customerId = authData.user?.id
        }

        // Create customer record
        if (customerId) {
          const { error: customerError } = await supabase.from("customers").insert({
            id: customerId,
            name: customerInfo.name,
            email: customerInfo.email,
          })

          if (customerError) {
            console.error("Error creating customer record:", customerError)
          }

          // Create address record
          const { error: addressError } = await supabase.from("addresses").insert({
            customer_id: customerId,
            line1: customerInfo.address1,
            line2: customerInfo.address2,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.postalCode,
            country: customerInfo.country,
            is_default: true,
          })

          if (addressError) {
            console.error("Error creating address record:", addressError)
          }
        }
      }

      // Create a temporary order to get an order ID
      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          shipping,
          customer: {
            name: customerInfo.name,
            email: customerInfo.email,
            id: customerId,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error creating payment preference")
      }

      setPreferenceId(data.preferenceId)
      setStep("payment")
    } catch (error: any) {
      console.error("Error creating payment preference:", error)
      setError(error.message || t.checkout.paymentError || "Payment error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSuccess = () => {
    // Clear the cart after successful payment
    clearCart();
    // Redirect to confirmation page
    router.push("/checkout/confirmation");
  }

  const onError = (errorMessage: string) => {
    toast({
      title: t.common?.error || "Error",
      description: errorMessage,
      variant: "destructive",
    })
    setStep("info")
  }

  // Render loading state
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 bg-wine-600 rounded-full mx-auto mb-4"></div>
            <p className="text-wine-800">Inicializando checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (initError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>Error de autenticación: {initError}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/auth/sign-in')}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {cartItems.length === 0 ? (
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t.cart.empty}</h1>
          <p className="mb-6">{t.checkout?.emptyCartMessage || "Añade productos a tu carrito antes de continuar con la compra."}</p>
          <Button onClick={() => router.push("/products")} className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
            {t.navigation.products}
          </Button>
        </div>
      ) : (
        <div className="container px-4 py-12">
          <h1 className="text-3xl font-bold text-primary mb-8">{t.checkout?.title || "Checkout"}</h1>

          {step === "info" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmitInfo}>
                  {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

                  <div className="space-y-8">
                    {(() => {
                      console.log("Debug user state:", { user: !!user, isInitialized, userEmail: user?.email });
                      return null;
                    })()}
                    {!user && isInitialized && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                          <strong>Nota:</strong> Se creará una cuenta automáticamente con tu información para gestionar tu pedido.
                        </p>
                      </div>
                    )}
                    
                    <div className="border rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">{t.checkout?.contactInfo || "Contact Information"}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          id="name"
                          name="name"
                          label={t.checkout?.fullName || "Nombre completo"}
                          value={customerInfo.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          autoComplete="name"
                          required
                          showValidation={touchedFields.name}
                          validation={validateRequired(customerInfo.name, 'El nombre')}
                          error={fieldErrors.name}
                        />
                        <FormInput
                          id="email"
                          name="email"
                          type="email"
                          label={t.checkout?.email || "Email"}
                          value={customerInfo.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          readOnly={!!user}
                          className={user ? "bg-muted" : ""}
                          autoComplete="email"
                          required
                          showValidation={touchedFields.email}
                          validation={validateEmail(customerInfo.email)}
                          error={fieldErrors.email}
                        />
                        <div className="md:col-span-2">
                          <FormInput
                            id="phone"
                            name="phone"
                            type="tel"
                            label={t.checkout?.phone || "Teléfono"}
                            value={customerInfo.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            autoComplete="tel"
                            placeholder="Ej: +54 9 11 1234-5678"
                            required
                            showValidation={touchedFields.phone}
                            validation={validatePhone(customerInfo.phone, true)}
                            error={fieldErrors.phone}
                            helperText="Obligatorio - Te contactaremos para coordinar la entrega"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">{t.checkout?.shippingAddress || "Shipping Address"}</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <FormInput
                          id="address1"
                          name="address1"
                          label={t.checkout?.address1 || "Dirección"}
                          value={customerInfo.address1}
                          onChange={(e) => handleFieldChange('address1', e.target.value)}
                          autoComplete="address-line1"
                          required
                          showValidation={touchedFields.address1}
                          validation={validateRequired(customerInfo.address1, 'La dirección')}
                          error={fieldErrors.address1}
                        />
                        <FormInput
                          id="address2"
                          name="address2"
                          label={t.checkout?.address2 || "Dirección línea 2 (Opcional)"}
                          value={customerInfo.address2}
                          onChange={(e) => handleFieldChange('address2', e.target.value)}
                          autoComplete="address-line2"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="city"
                            name="city"
                            label={t.checkout?.city || "Ciudad"}
                            value={customerInfo.city}
                            onChange={(e) => handleFieldChange('city', e.target.value)}
                            autoComplete="address-level2"
                            required
                            showValidation={touchedFields.city}
                            validation={validateRequired(customerInfo.city, 'La ciudad')}
                            error={fieldErrors.city}
                          />
                          <div className="space-y-2">
                            <Label htmlFor="state">{t.checkout?.state || "Provincia"} <span className="text-red-500">*</span></Label>
                            <Select
                              value={customerInfo.state}
                              onValueChange={(value) => {
                                setCustomerInfo(prev => ({ ...prev, state: value }))
                                setTouchedFields(prev => ({ ...prev, state: true }))
                              }}
                            >
                              <SelectTrigger className={!customerInfo.state && touchedFields.state ? "border-red-500" : ""}>
                                <SelectValue placeholder="Selecciona una provincia" />
                              </SelectTrigger>
                              <SelectContent>
                                {ARGENTINA_PROVINCES.map((province) => (
                                  <SelectItem key={province} value={province}>
                                    {province}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!customerInfo.state && touchedFields.state && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                La provincia es requerida
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="postalCode"
                            name="postalCode"
                            label={t.checkout?.postalCode || "Código Postal"}
                            value={customerInfo.postalCode}
                            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                            autoComplete="postal-code"
                            required
                            showValidation={touchedFields.postalCode}
                            validation={validatePostalCode(customerInfo.postalCode, true)}
                            error={fieldErrors.postalCode}
                            helperText="4 dígitos (ej: 1425)"
                          />
                          <div className="space-y-2">
                            <Label htmlFor="country">{t.checkout?.country || "Country"}</Label>
                            <Input
                              id="country"
                              name="country"
                              required
                              value={customerInfo.country}
                              onChange={handleInputChange}
                            autoComplete="country-name"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-8 w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !isFormValid() || cartItems.reduce((total, item) => total + item.quantity, 0) < 3}
                  >
                    {isSubmitting ? (t.checkout?.processing || "Processing...") : (t.checkout?.proceedToPayment || "Proceed to Payment")}
                  </Button>
                  
                  {(() => {
                    const hasBoxes = cartItems.some(item => item.is_box || item.category === 'Boxes')
                    const totalBottles = cartItems.reduce((total, item) => total + item.quantity, 0)
                    
                    if (hasBoxes) {
                      return (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>✅ Boxes detectados:</strong> No hay mínimo de botellas para boxes
                          </p>
                        </div>
                      )
                    }
                    
                    if (totalBottles < 3) {
                      const plural = totalBottles === 1 ? '' : 's'
                      return (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Nota:</strong> {t.checkout?.minimumBottlesNote?.replace('{count}', totalBottles.toString()).replace('{plural}', plural) || `Para compras individuales, el mínimo es de 3 botellas. Actualmente tienes ${totalBottles} botella${plural}.`}
                          </p>
                        </div>
                      )
                    }
                    
                    return null
                  })()}
                </form>
              </div>

              <div className="lg:col-span-1">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  totalSavings={totalSavings}
                  finalTotal={finalTotal}
                  shipping={shipping}
                  t={t}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">{t.checkout?.paymentInformation || "Payment Information"}</h2>
                <p className="mb-4">{t.checkout?.paymentDescription || "Please complete your payment using Mercado Pago."}</p>

                {preferenceId && (
                  <div className="py-4">
                    <MercadoPagoCheckout
                      preferenceId={preferenceId}
                      onSuccess={onSuccess}
                      onError={onError}
                    />
                  </div>
                )}
                
                <Button
                  onClick={() => setStep("info")}
                  variant="outline"
                  className="mt-4"
                >
                  {t.checkout?.backToInformation || "Back to Information"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
