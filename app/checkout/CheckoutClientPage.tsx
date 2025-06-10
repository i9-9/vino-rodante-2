"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrder } from "@/lib/actions"
import { redirect } from "next/navigation"
import type { CartItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function CheckoutClientPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [total, setTotal] = useState(0)

  const handleSubmit = async (formData: FormData) => {
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

              <Button type="submit" size="lg" className="w-full bg-[#A83935] hover:bg-[#A83935]/90 text-white">
                Complete Order
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

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
