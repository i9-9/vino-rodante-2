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
import { createClient } from '@/lib/supabase/server'
import { useTranslations } from "@/lib/providers/translations-provider"
import { MercadoPagoCheckout } from "@/components/ui/mercado-pago-checkout"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/hooks/use-cart"

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
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
  const tax = subtotal * 0.21 // 21% IVA in Argentina
  const shipping = subtotal > 10000 ? 0 : 1500 // Free shipping over 10,000 ARS
  const total = subtotal + tax + shipping

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      router.push("/products");
      return;
    }

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
  }, [user, isLoading, router, cartItems.length])

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

  if (cartItems.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.cart.empty}</h1>
        <p className="mb-6">{t.checkout?.emptyCartMessage || "Añade productos a tu carrito antes de continuar con la compra."}</p>
        <Button onClick={() => router.push("/products")} className="bg-[#A83935] hover:bg-[#A83935]/90 text-white">
          {t.navigation.products}
        </Button>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">{t.checkout?.title || "Checkout"}</h1>

      {step === "info" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitInfo}>
              {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

              <div className="space-y-8">
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
                  <p>{t.checkout?.tax || "Tax (21% IVA)"}</p>
                  <p>{formatCurrency(tax)}</p>
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
  )
}
