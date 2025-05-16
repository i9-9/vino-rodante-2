import { createClient } from './supabase/server'
import type { Product } from "./types"

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Error fetching product by slug:", error)
    return undefined
  }

  return data as Product
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product by id:", error)
    return undefined
  }

  return data as Product
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").eq("category", category).order("name")

  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }

  return data as Product[]
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").eq("featured", true).order("name")

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return data as Product[]
}

// Admin functions (for future use)
export async function createProduct(product: Omit<Product, "id">): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").insert([product]).select().single()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return data as Product
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating product:", error)
    return null
  }

  return data as Product
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}

export async function updateProductStock(id: string, quantity: number): Promise<boolean> {
  const supabase = await createClient()
  // First get the current stock
  const { data: product, error: fetchError } = await supabase.from("products").select("stock").eq("id", id).single()

  if (fetchError || !product) {
    console.error("Error fetching product stock:", fetchError)
    return false
  }

  // Calculate new stock and update
  const newStock = Math.max(0, product.stock - quantity)

  const { error: updateError } = await supabase.from("products").update({ stock: newStock }).eq("id", id)

  if (updateError) {
    console.error("Error updating product stock:", updateError)
    return false
  }

  return true
}
