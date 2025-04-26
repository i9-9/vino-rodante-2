"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CartItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/lib/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { useTranslations } from "@/lib/providers/translations-provider"
import { MercadoPagoCheckout } from "@/components/ui/mercado-pago-checkout"
import { useToast } from "@/components/ui/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
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

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.21 // 21% IVA in Argentina
  const shipping = subtotal > 10000 ? 0 : 1500 // Free shipping over 10,000 ARS
  const total = subtotal + tax + shipping

  useEffect(() => {
    // Get cart from cookies
    const getCart = () => {
      const cartCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cart="))
        ?.split("=")[1]

      if (cartCookie) {
        try {
          const cart = JSON.parse(decodeURIComponent(cartCookie))
          setCartItems(cart)

          if (cart.length === 0) {
            router.push("/products")
          }
        } catch (error) {
          console.error("Error parsing cart cookie:", error)
          router.push("/products")
        }
      } else {
        router.push("/products")
      }
    }

    getCart()

    // If user is logged in, fetch their information
    if (user && !isLoading) {
      const fetchUserInfo = async () => {
        const { data, error } = await supabase.from("customers").select(`*, addresses(*)`).eq("id", user.id).single()

        if (data) {
          setCustomerInfo((prev) => ({
            ...prev,
            name: data.name,
            email: user.email || "",
          }))

          // If user has a default address, use it
          if (data.addresses && data.addresses.length > 0) {
            const defaultAddress = data.addresses.find((addr: any) => addr.is_default) || data.addresses[0]

            setCustomerInfo((prev) => ({
              ...prev,
              address1: defaultAddress.line1,
              address2: defaultAddress.line2 || "",
              city: defaultAddress.city,
              state: defaultAddress.state,
              postalCode: defaultAddress.postal_code,
              country: defaultAddress.country,
            }))
          }
        }
      }

      fetchUserInfo()
    }
  }, [user, isLoading, router])

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
      setError(t.checkout.allFieldsRequired)
      setIsSubmitting(false)
      return
    }

    try {
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
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error creating payment preference")
      }

      setPreferenceId(data.preferenceId)
      setStep("payment")
    } catch (error) {
      console.error("Error creating payment preference:", error)
      setError(t.checkout.paymentError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    // The user will be redirected to the success URL by Mercado Pago
  }

  const handlePaymentError = (errorMessage: string) => {
    toast({
      title: t.common.error,
      description: errorMessage,
      variant: "destructive",
    })
    setStep("info")
  }

  if (cartItems.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">{t.checkout.title}</h1>

      {step === "info" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitInfo}>
              {error && <div className="mb-6 p-4 bg-error/10 text-error rounded-md">{error}</div>}

              <div className="space-y-8">
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">{t.checkout.contactInfo}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.checkout.fullName}</Label>
                      <Input id="name" name="name" required value={customerInfo.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.checkout.email}</Label>
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
                  <h2 className="text-xl font-semibold mb-4">{t.checkout.shippingAddress}</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address1">{t.checkout.address1}</Label>
                      <Input
                        id="address1"
                        name="address1"
                        required
                        value={customerInfo.address1}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address2">{t.checkout.address2}</Label>
                      <Input id="address2" name="address2" value={customerInfo.address2} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t.checkout.city}</Label>
                        <Input id="city" name="city" required value={customerInfo.city} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">{t.checkout.state}</Label>
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
                        <Label htmlFor="postalCode">{t.checkout.postalCode}</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          required
                          value={customerInfo.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">{t.checkout.country}</Label>
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

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.common.loading : t.checkout.continueToPayment}
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">{t.checkout.orderSummary}</h2>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.common.quantity}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <p>{t.common.subtotal}</p>
                  <p>{formatCurrency(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p>{t.common.tax}</p>
                  <p>{formatCurrency(tax)}</p>
                </div>
                <div className="flex justify-between">
                  <p>{t.common.shipping}</p>
                  <p>{shipping === 0 ? t.common.free : formatCurrency(shipping)}</p>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <p>{t.common.total}</p>
                  <p>{formatCurrency(total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.checkout.paymentInfo}</h2>
            <p className="mb-6 text-muted-foreground">{t.checkout.selectPaymentMethod}</p>

            {preferenceId && (
              <MercadoPagoCheckout
                preferenceId={preferenceId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}

            <Button variant="outline" className="w-full mt-4" onClick={() => setStep("info")}>
              {t.common.back}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
