"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import type { CartItem } from "../types"

interface CartContextType {
  cartItems: CartItem[]
  subtotal: number
  itemCount: number
}

export const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [itemCount, setItemCount] = useState(0)

  // Load cart from cookies on client side
  useEffect(() => {
    const loadCart = () => {
      const cartCookie = document.cookie.split("; ").find((row) => row.startsWith("cart="))

      if (cartCookie) {
        const cartValue = cartCookie.split("=")[1]
        try {
          const parsedCart = JSON.parse(decodeURIComponent(cartValue))
          setCartItems(parsedCart)
        } catch (error) {
          console.error("Error parsing cart cookie:", error)
          setCartItems([])
        }
      }
    }

    loadCart()

    // Listen for storage events to sync cart across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        loadCart()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Calculate subtotal and item count whenever cart changes
  useEffect(() => {
    const newSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

    const newItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

    setSubtotal(newSubtotal)
    setItemCount(newItemCount)
  }, [cartItems])

  return <CartContext.Provider value={{ cartItems, subtotal, itemCount }}>{children}</CartContext.Provider>
}
