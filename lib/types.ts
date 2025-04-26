export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  category: string
  year: string
  region: string
  varietal: string
  stock: number
  featured: boolean
}

export interface CartItem extends Product {
  quantity: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name?: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  user_id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  created_at?: string
  order_items?: OrderItem[]
  customer: {
    name: string
    email: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  payment: {
    method: string
    transaction_id: string
  }
}
