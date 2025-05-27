"use server"

import { revalidatePath } from "next/cache"
import { cookies as nextCookies } from "next/headers"
import { redirect } from "next/navigation"
import { getProductById, updateProductStock } from "./products"
import { createClient } from './supabase/server'
import type { CartItem } from "./types"
import { v4 as uuidv4 } from "uuid"

// Get the authenticated user from the server
async function getUser() {
  const cookieStore = await nextCookies()
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user
}

// Newsletter subscription
export async function subscribeToNewsletter(email: string) {
  if (!email) {
    return { error: "El correo electrónico es requerido" }
  }

  try {
    const supabase = await createClient()
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single()

    if (existingSubscriber) {
      return { success: true }
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([
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

  const cookieStore = await nextCookies()
  const cartCookie = cookieStore.get("cart")?.value
  let cart: CartItem[] = []

  if (cartCookie) {
    cart = JSON.parse(cartCookie)
  }

  const existingItemIndex = cart.findIndex((item) => item.id === productId)

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1,
    })
  }

  cookieStore.set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7,
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

  const cookieStore = await nextCookies()
  const cartCookie = cookieStore.get("cart")?.value

  if (!cartCookie) {
    return { error: "El carrito está vacío" }
  }

  let cart: CartItem[] = JSON.parse(cartCookie)

  cart = cart.filter((item) => item.id !== productId)

  cookieStore.set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7,
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

  const cookieStore = await nextCookies()
  const cartCookie = cookieStore.get("cart")?.value

  if (!cartCookie) {
    return { error: "El carrito está vacío" }
  }

  let cart: CartItem[] = JSON.parse(cartCookie)

  const itemIndex = cart.findIndex((item) => item.id === productId)

  if (itemIndex === -1) {
    return { error: "Artículo no encontrado en el carrito" }
  }

  if (quantity <= 0) {
    cart = cart.filter((item) => item.id !== productId)
  } else {
    cart[itemIndex].quantity = quantity
  }

  cookieStore.set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  revalidatePath("/")

  return { success: true }
}

export async function clearCart() {
  const cookieStore = await nextCookies()
  cookieStore.delete("cart")
  revalidatePath("/")
  return { success: true }
}

export async function createOrder(formData: FormData) {
  const cookieStore = await nextCookies()
  const cartCookie = cookieStore.get("cart")?.value

  if (!cartCookie) {
    return { error: "El carrito está vacío" }
  }

  const cart: CartItem[] = JSON.parse(cartCookie)

  if (cart.length === 0) {
    return { error: "El carrito está vacío" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const address1 = formData.get("address1") as string
  const address2 = (formData.get("address2") as string) || null
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const postalCode = formData.get("postalCode") as string
  const country = formData.get("country") as string

  if (!name || !email || !address1 || !city || !state || !postalCode || !country) {
    return { error: "Todos los campos requeridos deben ser completados" }
  }

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.21
  const shipping = subtotal > 10000 ? 0 : 1500
  const total = subtotal + tax + shipping

  try {
    const user = await getUser()
    let customerId: string
    const supabase = await createClient()

    if (user) {
      customerId = user.id
      await supabase
        .from("customers")
        .upsert({ id: user.id, name, email: user.email })
    } else {
      const { data: existingCustomer, error: customerFetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email)
        .single()

      if (customerFetchError || !existingCustomer) {
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

    const orderId = uuidv4()
    const { error: orderError } = await supabase
      .from("orders")
      .insert([
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

    const orderItems = cart.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError)
      return { error: "Error al crear los artículos del pedido" }
    }

    for (const item of cart) {
      await updateProductStock(item.id, item.quantity)
    }

    cookieStore.delete("cart")
    cookieStore.set("lastOrder", orderId, {
      maxAge: 60 * 60,
      path: "/",
    })

    redirect(`/checkout/confirmation?orderId=${orderId}`)
  } catch (error) {
    console.error("Error creating order:", error)
    return { error: "Ocurrió un error inesperado" }
  }
}
