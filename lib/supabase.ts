import { createClient } from '@supabase/supabase-js'

// ==========================
// Supabase client
// ==========================
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
export type Role = 'admin' | 'operator'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Role
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
  updated_at?: string
  // Note: categories and ingredients removed — use product_categories and option tables
}

export interface SupabaseProduct extends Product {
  ingredients?: string[]
  categories?: string[]
}

export interface Order {
  id: string
  customer_id: string
  status:
    | 'pending'
    | 'accepted'
    | 'preparing'
    | 'ready'
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
  product?: Product
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[]
  profile?: Profile
}

// ==========================
// Função para criar admin
// ==========================
export async function createAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Service Role Key não definida no .env')
    return
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'glvinformatica2024@gmail.com',
      password: '1ao8',
      email_confirm: true,
    })
    if (error) throw error
    console.log('Usuário criado com sucesso, ID:', data.user.id)

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: data.user.id, full_name: 'Administrador GLV', role: 'admin' })
    if (profileError) throw profileError

    console.log('Profile admin criado com sucesso!')
  } catch (err: any) {
    console.error('Erro ao criar admin:', err.message || err)
  }
}

/**
 * Garantir que um profile de admin/operator exista para um dado userId.
 * Usar somente quando criar/gerenciar contas administrativas.
 */
export async function ensureAdminProfile(userId: string, full_name?: string, role: Role = 'admin') {
  if (!userId) throw new Error('userId é obrigatório')

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error && (error as any).code !== 'PGRST116') {
      // se erro e não for "no rows" (código pode variar), lançar
      console.error('ensureAdminProfile: select error', error)
      throw error
    }

    if (data && data.role) {
      // já existe profile
      return data
    }

    // criar profile com role segura (admin/operator)
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, full_name: full_name ?? null, role })

    if (insertError) {
      console.error('ensureAdminProfile: insert error', insertError)
      throw insertError
    }

    return { role }
  } catch (err) {
    console.error('ensureAdminProfile failed', err)
    throw err
  }
}

// ==========================
// Rodar a função se necessário
// ==========================
// createAdmin() // Execute apenas **uma vez** no servidor
