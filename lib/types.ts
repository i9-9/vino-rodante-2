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
  is_visible: boolean
  free_shipping?: boolean
}

export interface CartItem extends Product {
  quantity: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product_name?: string
  product_image?: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  created_at: string
  customer?: {
    name: string
    email: string
  }
  order_items: OrderItem[]
}

export interface Address {
  id: string
  customer_id: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  created_at: string
}
