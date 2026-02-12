import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  phone: z.string().optional().nullable(),
  role: z.enum(['customer', 'admin']).optional().default('customer'),
})

export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Server not configured to create users' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { createClient } = await import('@/lib/clients')

    // Delegate to lib/clients which already has server-side flow
    const created = await createClient(parsed.data)

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (err: any) {
    console.error('API /api/admin/create-user error', err)
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
  }
}
