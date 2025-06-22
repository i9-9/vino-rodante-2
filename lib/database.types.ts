export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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
          created_at: string
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
          created_at?: string
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
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string | null
          email: string | null
          created_at: string
          is_admin: boolean
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string
          is_admin?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          status: string
          created_at: string
          order_items: {
            id: string
            order_id: string
            product_id: string
            product_name?: string
            quantity: number
            price: number
          }[]
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          status?: string
          created_at?: string
          order_items?: {
            id?: string
            order_id?: string
            product_id: string
            product_name?: string
            quantity: number
            price: number
          }[]
        }
        Update: {
          id?: string
          user_id?: string
          total?: number
          status?: string
          created_at?: string
          order_items?: {
            id?: string
            order_id?: string
            product_id: string
            product_name?: string
            quantity: number
            price: number
          }[]
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image: string | null
          category: string | null
          year: string | null
          region: string | null
          varietal: string | null
          stock: number
          featured: boolean
          is_visible: boolean
          created_at: string
          customer_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image?: string | null
          category?: string | null
          year?: string | null
          region?: string | null
          varietal?: string | null
          stock?: number
          featured?: boolean
          is_visible?: boolean
          created_at?: string
          customer_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          category?: string | null
          year?: string | null
          region?: string | null
          varietal?: string | null
          stock?: number
          featured?: boolean
          is_visible?: boolean
          created_at?: string
          customer_id?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          interval: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          interval?: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          interval?: string
          active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
