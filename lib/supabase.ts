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
// Tipos do projeto (baseados no schema real do banco)
// ==========================

export interface Profile {
  id: string // vem do auth.users
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number
  original_price_cents: number | null
  image_url: string | null
  active: boolean
  created_at: string
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
    | 'cancelled'
  payment_method: 'cash' | 'card' | 'pix'
  notes: string | null
  total_cents: number
  delivery_lat: number | null
  delivery_lng: number | null
  change_for_cents: number | null
  customer_name: string | null
  customer_phone: string | null
  delivery_address: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price_cents: number
  subtotal_cents: number
  product?: Product // relacionamento manual
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[]
  profile?: Profile
}
