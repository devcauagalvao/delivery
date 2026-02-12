import { supabase } from './supabase'
import { z } from 'zod'

// --- Zod schemas (validate payloads before DB calls) ---
const clientCreateSchema = z.object({
  // Either supply an existing `id` (auth.users.id) OR supply `email`+`password` to create a new auth user via server
  id: z.string().uuid().optional(),
  full_name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(0).nullable().optional(),
  role: z.enum(['customer', 'admin']).optional().default('customer'),
  // For convenience: accept email/password when creating a new auth user (server-only flow recommended)
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
})

const clientUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(['customer', 'admin']).optional(),
})

export type Client = {
  id: string
  full_name: string
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at?: string | null
}

// --- Utilities ---
function sanitizeSearch(q?: string) {
  if (!q) return undefined
  const s = q.trim()
  return s.length === 0 ? undefined : s
}

// --- API functions ---
export async function getClients({ search, page = 1, pageSize = 20 }: { search?: string | undefined; page?: number; pageSize?: number }) {
  const q = sanitizeSearch(search)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    // Build base query
    let builder = supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (q) {
      // if q is numeric-ish, search phone as well
      const onlyDigits = q.replace(/\D/g, '')
      builder = builder.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`)
    }

    const { data, error, count } = await builder.range(from, to)
    if (error) throw error

    return { data: (data ?? []) as Client[], total: count ?? 0, page, pageSize }
  } catch (err: any) {
    console.error('getClients error', err)
    throw new Error(err?.message || 'Erro ao buscar clientes')
  }
}

/**
 * createClient
 * - If `payload.id` is provided => inserts a profile for an existing auth.user
 * - If `payload.email`+`payload.password` are provided => **SERVER** should create auth.user + profile using service role key.
 *   In-browser service-role operations are unsafe; prefer calling a server API that uses service key.
 */
export async function createClient(payload: unknown) {
  const parsed = clientCreateSchema.safeParse(payload)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    throw new Error(first?.message || 'Payload inválido')
  }
  const body = parsed.data

  // If caller provided `id` (existing auth.user) -> simple insert
  if (body.id) {
    try {
      const { data, error } = await supabase.from('profiles').insert({ id: body.id, full_name: body.full_name, phone: body.phone ?? null, role: body.role ?? 'customer' }).select().single()
      if (error) throw error
      return data as Client
    } catch (err: any) {
      console.error('createClient (existing id) error', err)
      // common Postgres constraint error messaging
      if (err?.code === '23505') throw new Error('Cliente já existe')
      throw new Error(err?.message || 'Erro ao criar cliente')
    }
  }

  // If email+password provided, we cannot create auth.user from browser safely.
  if (body.email && body.password) {
    // Use Supabase admin (service role) only on server side (throw helpful error client-side)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Criação de cliente por email/password deve ser feita via servidor (Service Role Key não está disponível aqui).')
    }

    // Server-side flow: create auth user (service role) then insert profile
    const admin = (await import('@supabase/supabase-js')).createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    try {
      const create = await admin.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true })
      if (create.error) throw create.error
      const userId = create.data.user.id

      const { data, error } = await admin.from('profiles').insert({ id: userId, full_name: body.full_name, phone: body.phone ?? null, role: body.role ?? 'customer' }).select().single()
      if (error) throw error
      return data as Client
    } catch (err: any) {
      console.error('createClient (service role) error', err)
      throw new Error(err?.message || 'Erro ao criar cliente (admin)')
    }
  }

  throw new Error('Para criar um cliente você deve fornecer `id` (usuário já existente) ou `email`+`password` (servidor)')
}

export async function updateClient(id: string, payload: unknown) {
  if (!id) throw new Error('id é obrigatório')
  const parsed = clientUpdateSchema.safeParse(payload)
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || 'Payload inválido')

  try {
    const { data, error } = await supabase.from('profiles').update(parsed.data).eq('id', id).select().single()
    if (error) throw error
    return data as Client
  } catch (err: any) {
    console.error('updateClient error', err)
    throw new Error(err?.message || 'Erro ao atualizar cliente')
  }
}

export async function deleteClient(id: string) {
  if (!id) throw new Error('id é obrigatório')
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (err: any) {
    console.error('deleteClient error', err)
    throw new Error(err?.message || 'Erro ao deletar cliente')
  }
}
