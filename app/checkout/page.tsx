"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CartItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/lib/providers/auth-provider"
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from "@/lib/providers/translations-provider"
import { MercadoPagoCheckout } from "@/components/ui/mercado-pago-checkout"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/hooks/use-cart"
import SupabaseGuard from "@/components/SupabaseGuard"

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()
  const { user, isInitialized, initError } = useAuth()
  const { cartItems, subtotal, clearCart } = useCart()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
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
  const supabase = createClient()

  // Calculate totals
  // Los precios ya incluyen IVA, por lo que no agregamos IVA adicional
  const shipping = subtotal > 10000 ? 0 : 1500 // Free shipping over 10,000 ARS
  const total = subtotal + shipping

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
      router.push("/products");
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

    // Validate required fields
    if (
      !customerInfo.name ||
      !customerInfo.email ||
      !customerInfo.address1 ||
      !customerInfo.city ||
      !customerInfo.state ||
      !customerInfo.postalCode ||
      !customerInfo.country
    ) {
      setError(t.checkout.allFieldsRequired || "All fields are required")
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
          customer: {
            name: customerInfo.name,
            email: customerInfo.email,
            id: customerId, // Include customer ID if available
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
                        <div className="space-y-2">
                          <Label htmlFor="name">{t.checkout?.fullName || "Full Name"}</Label>
                          <Input id="name" name="name" required value={customerInfo.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t.checkout?.email || "Email"}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={customerInfo.email}
                            onChange={handleInputChange}
                            readOnly={!!user}
                            className={user ? "bg-muted" : ""}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-6">
                      <h2 className="text-xl font-semibold mb-4">{t.checkout?.shippingAddress || "Shipping Address"}</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address1">{t.checkout?.address1 || "Address Line 1"}</Label>
                          <Input
                            id="address1"
                            name="address1"
                            required
                            value={customerInfo.address1}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address2">{t.checkout?.address2 || "Address Line 2 (Optional)"}</Label>
                          <Input id="address2" name="address2" value={customerInfo.address2} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">{t.checkout?.city || "City"}</Label>
                            <Input id="city" name="city" required value={customerInfo.city} onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">{t.checkout?.state || "State/Province"}</Label>
                            <Input
                              id="state"
                              name="state"
                              required
                              value={customerInfo.state}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">{t.checkout?.postalCode || "Postal Code"}</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              required
                              value={customerInfo.postalCode}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">{t.checkout?.country || "Country"}</Label>
                            <Input
                              id="country"
                              name="country"
                              required
                              value={customerInfo.country}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-8 w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (t.checkout?.processing || "Processing...") : (t.checkout?.proceedToPayment || "Proceed to Payment")}
                  </Button>
                </form>
              </div>

              <div className="lg:col-span-1">
                <div className="border rounded-lg p-6 sticky top-20">
                  <h2 className="text-xl font-semibold mb-4">{t.checkout?.orderSummary || "Order Summary"}</h2>

                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-3 flex gap-3">
                        <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.year} • {item.varietal}
                          </p>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm">{t.common.quantity}: {item.quantity}</p>
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <p>{t.checkout?.subtotal || "Subtotal"}</p>
                      <p>{formatCurrency(subtotal)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>{t.checkout?.shipping || "Shipping"}</p>
                      <p>{shipping === 0 ? (t.checkout?.free || "Free") : formatCurrency(shipping)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <p>{t.checkout?.total || "Total"}</p>
                      <p>{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>
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
