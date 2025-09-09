"use client"

import type React from "react"

import { createContext, useCallback, useEffect, useState } from "react"
import type { CartItem, Product } from "../types"
import { useDiscounts } from "../hooks/use-discounts"

interface CartContextType {
  cartItems: CartItem[]
  subtotal: number
  itemCount: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateCartItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  // Discount-related properties
  totalSavings: number
  finalTotal: number
}

export const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [itemCount, setItemCount] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)
  const [finalTotal, setFinalTotal] = useState(0)
  
  // Hook para manejar descuentos
  const { applyDiscountsToCart } = useDiscounts()

  // Load cart from cookies on client side
  const loadCart = useCallback(() => {
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
  }, [])

  useEffect(() => {
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
  }, [loadCart])

  // Calculate subtotal and item count whenever cart changes
  useEffect(() => {
    // Aplicar descuentos a los productos del carrito
    const itemsWithDiscounts = applyDiscountsToCart(cartItems)
    
    // Calcular subtotal original (sin descuentos)
    const newSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    
    // Calcular subtotal con descuentos aplicados
    const discountedSubtotal = itemsWithDiscounts.reduce((total, item) => {
      const itemPrice = item.discount ? item.discount.final_price : item.price
      return total + itemPrice * item.quantity
    }, 0)
    
    // Calcular ahorros totales
    const newTotalSavings = newSubtotal - discountedSubtotal
    
    // Calcular total final
    const newFinalTotal = discountedSubtotal

    const newItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

    setSubtotal(newSubtotal)
    setItemCount(newItemCount)
    setTotalSavings(newTotalSavings)
    setFinalTotal(newFinalTotal)
  }, [cartItems, applyDiscountsToCart])

  // Client-side cart functions
  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id)
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Increment quantity if item already in cart
        newItems = [...prevItems]
        newItems[existingItemIndex].quantity += 1
      } else {
        // Add new item to cart
        newItems = [...prevItems, { ...product, quantity: 1 }]
      }
      
      // Update cookie
      document.cookie = `cart=${encodeURIComponent(JSON.stringify(newItems))}; max-age=${60 * 60 * 24 * 7}; path=/`
      
      // Dispatch storage event to sync other tabs
      window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }))
      
      return newItems
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId)
      
      // Update cookie
      document.cookie = `cart=${encodeURIComponent(JSON.stringify(newItems))}; max-age=${60 * 60 * 24 * 7}; path=/`
      
      // Dispatch storage event to sync other tabs
      window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }))
      
      return newItems
    })
  }, [])

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.id === productId)
      
      if (itemIndex === -1) return prevItems
      
      let newItems: CartItem[];
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        newItems = prevItems.filter(item => item.id !== productId)
      } else {
        // Update quantity
        newItems = [...prevItems]
        newItems[itemIndex].quantity = quantity
      }
      
      // Update cookie
      document.cookie = `cart=${encodeURIComponent(JSON.stringify(newItems))}; max-age=${60 * 60 * 24 * 7}; path=/`
      
      // Dispatch storage event to sync other tabs
      window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }))
      
      return newItems
    })
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
    document.cookie = "cart=; max-age=0; path=/"
    window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }))
  }, [])

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        subtotal, 
        itemCount, 
        addToCart, 
        removeFromCart, 
        updateCartItemQuantity,
        clearCart,
        totalSavings,
        finalTotal
      }}
    >
        {children}
    </CartContext.Provider>
  )
}
