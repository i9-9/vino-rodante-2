"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getProductById, updateProductStock } from "./products"
import { supabase } from "./supabase"
import type { CartItem } from "./types"
import { v4 as uuidv4 } from "uuid"
import { createServerClient } from "@supabase/ssr"

// Get the authenticated user from the server
async function getUser() {
  const cookieStore = cookies()

  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabaseServer.auth.getSession()
  return session?.user
}

// Newsletter subscription
export async function subscribeToNewsletter(email: string) {
  if (!email) {
    return { error: "El correo electrónico es requerido" }
  }

  try {
    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single()

    if (existingSubscriber) {
      return { success: true } // Already subscribed, but we don't tell the user
    }

    // Add new subscriber
    const { error } = await supabase.from("newsletter_subscribers").insert([
      {
        email,
        status: "active",
      },
    ])

    if (error) {
      console.error("Error subscribing to newsletter:", error)
      return { error: "Error al suscribirse al boletín" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}

// Cart functions (still using cookies for cart)
export async function addToCart(formData: FormData) {
  const productId = formData.get("productId") as string

  if (!productId) {
    return { error: "Se requiere el ID del producto" }
  }

  const product = await getProductById(productId)

  if (!product) {
    return { error: "Producto no encontrado" }
  }

  const cartCookie = cookies().get("cart")?.value
  let cart: CartItem[] = []

  if (cartCookie) {
    cart = JSON.parse(cartCookie)
  }

  const existingItemIndex = cart.findIndex((item) => item.id === productId)

  if (existingItemIndex >= 0) {
    // Increment quantity if item already in cart
    cart[existingItemIndex].quantity += 1
  } else {
    // Add new item to cart
    cart.push({
      ...product,
      quantity: 1,
    })
  }

  // Save cart to cookies
  cookies().set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  revalidatePath("/")

  return { success: true }
}

export async function removeFromCart(formData: FormData) {
  const productId = formData.get("productId") as string

  if (!productId) {
    return { error: "Se requiere el ID del producto" }
  }

  const cartCookie = cookies().get("cart")?.value

  if (!cartCookie) {
    return { error: "El carrito está vacío" }
  }

  let cart: CartItem[] = JSON.parse(cartCookie)

  // Remove item from cart
  cart = cart.filter((item) => item.id !== productId)

  // Save cart to cookies
  cookies().set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  revalidatePath("/")

  return { success: true }
}

export async function updateCartItemQuantity(formData: FormData) {
  const productId = formData.get("productId") as string
  const quantity = Number.parseInt(formData.get("quantity") as string)

  if (!productId || isNaN(quantity)) {
    return { error: "Se requieren el ID del producto y la cantidad" }
  }

  const cartCookie = cookies().get("cart")?.value

  if (!cartCookie) {
    return { error: "El carrito está vacío" }
  }

  let cart: CartItem[] = JSON.parse(cartCookie)

  const itemIndex = cart.findIndex((item) => item.id === productId)

  if (itemIndex === -1) {
    return { error: "Artículo no encontrado en el carrito" }
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart = cart.filter((item) => item.id !== productId)
  } else {
    // Update quantity
    cart[itemIndex].quantity = quantity
  }

  // Save cart to cookies
  cookies().set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  revalidatePath("/")

  return { success: true }
}

export async function clearCart() {
  cookies().delete("cart")
  revalidatePath("/")
  return { success: true }
}

export async function createOrder(formData: FormData) {
  // Get cart items
  const cartCookie = cookies().get("cart")?.value

  if (!cartCookie) {
    return { error: "El carrito está vacío" }
  }

  const cart: CartItem[] = JSON.parse(cartCookie)

  if (cart.length === 0) {
    return { error: "El carrito está vacío" }
  }

  // Get customer information from form
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const address1 = formData.get("address1") as string
  const address2 = (formData.get("address2") as string) || null
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const postalCode = formData.get("postalCode") as string
  const country = formData.get("country") as string

  // Validate required fields
  if (!name || !email || !address1 || !city || !state || !postalCode || !country) {
    return { error: "Todos los campos requeridos deben ser completados" }
  }

  // Calculate order totals
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.21 // 21% IVA in Argentina
  const shipping = subtotal > 10000 ? 0 : 1500 // Free shipping over 10,000 ARS
  const total = subtotal + tax + shipping

  try {
    // Get authenticated user if available
    const user = await getUser()

    // Create or get customer
    let customerId: string

    if (user) {
      // Use the authenticated user's ID
      customerId = user.id

      // Update customer name if needed
      await supabase.from("customers").upsert({ id: user.id, name, email: user.email })
    } else {
      // Create or get customer by email for guest checkout
      const { data: existingCustomer, error: customerFetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email)
        .single()

      if (customerFetchError || !existingCustomer) {
        // Create new customer
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from("customers")
          .insert([{ name, email }])
          .select()
          .single()

        if (customerCreateError || !newCustomer) {
          console.error("Error creating customer:", customerCreateError)
          return { error: "Error al crear el cliente" }
        }

        customerId = newCustomer.id
      } else {
        customerId = existingCustomer.id
      }
    }

    // Create address
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert([
        {
          customer_id: customerId,
          line1: address1,
          line2: address2,
          city,
          state,
          postal_code: postalCode,
          country,
          is_default: true,
        },
      ])
      .select()
      .single()

    if (addressError || !address) {
      console.error("Error creating address:", addressError)
      return { error: "Error al crear la dirección" }
    }

    // Create order
    const orderId = uuidv4()
    const { error: orderError } = await supabase.from("orders").insert([
      {
        id: orderId,
        user_id: customerId,
        status: "pending",
        total,
      },
    ])

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { error: "Error al crear el pedido" }
    }

    // Create order items
    const orderItems = cart.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems)

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError)
      return { error: "Error al crear los artículos del pedido" }
    }

    // Update product stock
    for (const item of cart) {
      await updateProductStock(item.id, item.quantity)
    }

    // Clear cart after successful order
    cookies().delete("cart")

    // Store order ID in cookies for confirmation page
    cookies().set("lastOrder", orderId, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    // Redirect to confirmation page
    redirect(`/checkout/confirmation?orderId=${orderId}`)
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}
