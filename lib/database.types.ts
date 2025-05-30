export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
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
          created_at: string
        }
        Insert: {
          id?: string
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
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          price?: number
          image?: string
          category?: string
          year?: string
          region?: string
          varietal?: string
          stock?: number
          featured?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status: string
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: string
          total?: number
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          is_admin: boolean
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
          is_admin: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          is_admin: boolean
        }
      }
      addresses: {
        Row: {
          id: string
          customer_id: string
          line1: string
          line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
        }
        Insert: {
          id?: string
          customer_id: string
          line1: string
          line2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default?: boolean
        }
        Update: {
          id?: string
          customer_id?: string
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          status?: string
          created_at?: string
        }
      },
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          tagline: string | null
          image: string | null
          features: Json | null
          price_monthly: number | null
          price_bimonthly: number | null
          price_quarterly: number | null
          discount_percentage: number | null
          status: string | null
          display_order: number | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          tagline?: string | null
          image?: string | null
          features?: Json | null
          price_monthly?: number | null
          price_bimonthly?: number | null
          price_quarterly?: number | null
          discount_percentage?: number | null
          status?: string | null
          display_order?: number | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          tagline?: string | null
          image?: string | null
          features?: Json | null
          price_monthly?: number | null
          price_bimonthly?: number | null
          price_quarterly?: number | null
          discount_percentage?: number | null
          status?: string | null
          display_order?: number | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
