import { supabase } from './supabase'

export type CartOption = {
  option_id: string
  option_name: string
  unit_price_cents: number
  quantity: number
}

export type CartItem = {
  product_id: string
  product_name: string
  unit_price_cents: number
  quantity: number
  item_notes?: string | null
  selectedOptions?: CartOption[]
}

export async function createOrder({
  customer_name,
  customer_phone,
  is_delivery,
  delivery_address = null,
  delivery_notes = null,
  payment_method,
  notes = null,
  change_for_cents = null,
  idempotency_key = undefined,
  items = [],
}: {
  customer_name: string
  customer_phone: string
  is_delivery: boolean
  delivery_address?: string | null
  delivery_notes?: string | null
  payment_method: 'pix' | 'cash' | 'card'
  notes?: string | null
  change_for_cents?: number | null
  idempotency_key?: string | null
  items?: CartItem[]
}) {
  try {
    // Idempotency: se chave fornecida e pedido já existe, retornar existente
    if (idempotency_key) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('idempotency_key', idempotency_key)
        .limit(1)
        .maybeSingle()

      if (existing && existing.id) {
        return { id: existing.id }
      }
    }

    const orderPayload: any = {
      customer_name,
      customer_phone,
      is_delivery,
      delivery_address,
      delivery_notes,
      payment_method,
      notes,
      change_for_cents: change_for_cents ?? null,
      idempotency_key: idempotency_key ?? null,
    }

    // 1) inserir order
    const { data, error } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select('id')
      .single()

    if (error) {
      // Se erro de duplicidade por constraint no banco, tentar recuperar
      if ((error as any)?.code === '23505' && idempotency_key) {
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('idempotency_key', idempotency_key)
          .limit(1)
          .maybeSingle()
        if (existing && existing.id) return { id: existing.id }
      }
      throw error
    }

    const orderId = data.id

    // 2) inserir order_items + order_item_options (se houver)
    if (items && items.length > 0) {
      await insertOrderItems(orderId, items)
    }

    return { id: orderId }
  } catch (err) {
    console.error('createOrder error', err)
    throw err
  }
}

export async function insertOrderItems(orderId: string, items: CartItem[]) {
  if (!orderId) throw new Error('orderId is required')

  try {
    const itemsPayload = items.map((it) => ({
      order_id: orderId,
      product_id: it.product_id,
      product_name: it.product_name,
      unit_price_cents: it.unit_price_cents,
      quantity: it.quantity,
      item_notes: it.item_notes ?? null,
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select('id')

    if (itemsError) throw itemsError

    // insertedItems corresponds to array of inserted rows with ids
    // Now insert order_item_options if any
    const optionsPayload: any[] = []
    insertedItems?.forEach((inserted: any, idx: number) => {
      const original = items[idx]
      (original.selectedOptions || []).forEach((opt) => {
        optionsPayload.push({
          order_item_id: inserted.id,
          option_id: opt.option_id,
          option_name: opt.option_name,
          unit_price_cents: opt.unit_price_cents,
          quantity: opt.quantity,
        })
      })
    })

    if (optionsPayload.length > 0) {
      const { error: optsError } = await supabase.from('order_item_options').insert(optionsPayload)
      if (optsError) throw optsError
    }

    return { insertedCount: insertedItems?.length ?? 0 }
  } catch (err) {
    console.error('insertOrderItems error', err)
    throw err
  }
}

export async function applyCoupon(orderId: string, code: string) {
  try {
    const { data, error } = await supabase.rpc('apply_coupon', { p_order_id: orderId, p_code: code })
    if (error) throw error
    return data
  } catch (err) {
    console.error('applyCoupon error', err)
    throw err
  }
}

export async function getOrder(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    if (orderError) throw orderError

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    if (itemsError) throw itemsError

    const itemIds = (items || []).map((it: any) => it.id)
    const { data: itemOptions, error: optsError } = await supabase
      .from('order_item_options')
      .select('*')
      .in('order_item_id', itemIds)
    if (optsError) throw optsError

    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
    if (historyError) throw historyError

    return { order, items, itemOptions, history }
  } catch (err) {
    console.error('getOrder error', err)
    throw err
  }
}
