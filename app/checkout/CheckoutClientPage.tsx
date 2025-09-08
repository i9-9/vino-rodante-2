"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrder } from "@/lib/actions"
import type { CartItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function CheckoutClientPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [total, setTotal] = useState(0)
  const [cartError, setCartError] = useState<string | null>(null)

  // Función para validar el mínimo de botellas
  const validateCartMinimum = (cartItems: CartItem[]): boolean => {
    // Check if cart contains boxes (boxes don't have minimum bottle requirement)
    const hasBoxes = cartItems.some(item => item.is_box || item.category === 'Boxes' || item.category === 'boxes')
    
    if (hasBoxes) {
      // If cart contains boxes, no minimum requirement
      setCartError(null)
      return true
    }
    
    // For individual products only, apply 3-bottle minimum
    const totalBottles = cartItems.reduce((total, item) => total + item.quantity, 0)
    if (totalBottles < 3) {
      setCartError(`Para compras individuales, el mínimo es de 3 botellas. Actualmente tienes ${totalBottles} botella${totalBottles === 1 ? '' : 's'}.`)
      return false
    }
    setCartError(null)
    return true
  }

  const handleSubmit = async (formData: FormData) => {
    // Validar antes de enviar
    if (!validateCartMinimum(cart)) {
      return
    }

    try {
      const result = await createOrder(formData)
      if (result?.error) {
        console.error("Order creation error:", result.error)
        // Handle error display here if needed
      }
    } catch (error) {
      console.error("Order submission error:", error)
    }
  }

  useEffect(() => {
    // Get cart from client-side cookie
    const cartCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('cart='))
      ?.split('=')[1];

    if (!cartCookie) {
      window.location.href = "/products";
      return;
    }

    try {
      const parsedCart: CartItem[] = JSON.parse(decodeURIComponent(cartCookie))
      if (parsedCart.length === 0) {
        window.location.href = "/products";
        return;
      }
      setCart(parsedCart)

      // Validar mínimo de botellas
      validateCartMinimum(parsedCart)

      // Calculate totals
      const subtotalCalc = parsedCart.reduce((total, item) => total + item.price * item.quantity, 0)
      const taxCalc = subtotalCalc * 0.08 // 8% tax rate
      const shippingCalc = subtotalCalc > 100 ? 0 : 10 // Free shipping over $100
      const totalCalc = subtotalCalc + taxCalc + shippingCalc

      setSubtotal(subtotalCalc)
      setTax(taxCalc)
      setShipping(shippingCalc)
      setTotal(totalCalc)
    } catch (error) {
      console.error("Error parsing cart cookie:", error)
      window.location.href = "/products";
    }
  }, [])

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold text-[#5B0E2D] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form action={handleSubmit}>
            <div className="space-y-8">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel"
                      placeholder="Ej: +54 9 11 1234-5678"
                    />
                    <p className="text-sm text-gray-600">Opcional - Te contactaremos para coordinar la entrega</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input id="address1" name="address1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input id="address2" name="address2" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" name="state" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" name="postalCode" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" required defaultValue="United States" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiration">Expiration (MM/YY)</Label>
                      <Input id="expiration" placeholder="12/25" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" required />
                    </div>
                  </div>
                </div>
              </div>

              {cartError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {cartError}
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={cartError !== null}
              >
                Complete Order
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Información sobre mínimo de botellas */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {cart.some(item => item.is_box || item.category === 'Boxes' || item.category === 'boxes') ? (
                <>
                  <p className="text-sm text-blue-800">
                    <strong>Boxes incluidos:</strong> Sin mínimo de botellas requerido
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Los boxes ya incluyen la cantidad perfecta de vinos
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-blue-800">
                    <strong>Mínimo requerido:</strong> 3 botellas para compras individuales
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Total en carrito: {cart.reduce((total, item) => total + item.quantity, 0)} botella{cart.reduce((total, item) => total + item.quantity, 0) === 1 ? '' : 's'}
                  </p>
                </>
              )}
            </div>

            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax</p>
                <p>{formatCurrency(tax)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>{shipping === 0 ? "Free" : formatCurrency(shipping)}</p>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <p>Total</p>
                <p>{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
