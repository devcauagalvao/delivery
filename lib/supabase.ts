  import { createClient } from '@supabase/supabase-js'

  // ==========================
  // Supabase client
  // ==========================
  // Use variáveis de ambiente para não expor a chave diretamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL ou ANON Key não definidos. Verifique seu arquivo .env.local'
    )
  }

  export const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // ==========================
  // Tipos do projeto
  // ==========================

  export interface Profile {
    id: string
    full_name: string
    phone?: string
    role: 'customer' | 'admin'
    created_at: string
    updated_at: string
  }

  export interface Product {
    id: string
    name: string
    description?: string
    price_cents: number
    original_price_cents?: number
    image_url?: string
    active: boolean
    created_at: string
    updated_at: string
  }

  export interface Order {
    id: string
    customer_id: string
    status:
      | 'pending'
      | 'accepted'
      | 'preparing'
      | 'out_for_delivery'
      | 'delivered'
      | 'rejected'
    payment_method: 'cash' | 'card' | 'pix'
    total_cents: number
    notes?: string
    customer_name: string
    customer_phone: string
    delivery_address?: string
    delivery_lat?: number
    delivery_lng?: number
    change_for_cents?: number
    created_at: string
    updated_at: string
  }

  export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    unit_price_cents: number
    created_at: string
    product?: Product
  }

  export type OrderWithItems = Order & {
    order_items: (OrderItem & { product: Product })[]
    profile?: Profile
  }
