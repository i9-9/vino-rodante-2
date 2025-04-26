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

export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
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
  created_at: string
}
