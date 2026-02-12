"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { toast } from 'sonner'
import { getOrder } from '@/lib/orders'
import { getSettings } from '@/lib/settings'

interface OrderItem {
  id: string
  product_name?: string
  quantity?: number
}

interface Order {
  id: string
  status: string
  payment_method?: string
  total_cents?: number
  order_items?: OrderItem[]
  created_at?: string
  status_history?: { id: string; status: string; created_at: string; note?: string }[]
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [{ order: ord, items, itemOptions, history }, appSettings] = await Promise.all([
          getOrder(id),
          getSettings().catch(() => null),
        ])

        if (!ord) throw new Error('Pedido não encontrado')

        // attach item options to items
        const itemsWithOptions = (items || []).map((it: any) => ({
          ...it,
          options: (itemOptions || []).filter((o: any) => o.order_item_id === it.id),
        }))

        setOrder({ ...(ord as any), order_items: itemsWithOptions, status_history: history || [] })
        setSettings(appSettings)
      } catch (err: any) {
        console.error(err)
        toast.error('Não foi possível carregar o pedido')
      } finally {
        setLoading(false)
      }
    }

    if (!id) return
    fetch()
  }, [id])

  const formatPrice = (cents?: number) =>
    cents == null
      ? 'R$ 0,00'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header searchQuery="" setSearchQuery={() => {}} user={null} profile={null} signOut={async () => {}} />
        <div className="p-6">Carregando pedido...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header searchQuery="" setSearchQuery={() => {}} user={null} profile={null} signOut={async () => {}} />
        <div className="p-6">Pedido não encontrado.</div>
        <Footer />
      </div>
    )
  }

  const isOutForDelivery = order.status === 'out_for_delivery'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header searchQuery="" setSearchQuery={() => {}} user={null} profile={null} signOut={async () => {}} />

      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Meu Pedido</h1>

        <div className="bg-[#111111] border border-[#222] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Pedido</div>
              <div className="font-mono text-sm">#{order.id?.slice(0, 8)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Total</div>
              <div className="font-semibold">{formatPrice(order.total_cents)}</div>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className="font-semibold text-lg">{order.status}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Pagamento</div>
                <div className="font-semibold">{order.payment_method ?? 'Não informado'}</div>
              </div>
            </div>

              {isOutForDelivery && (
                <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-700 text-green-300">
                  Seu pedido saiu para entrega 🚚
                </div>
              )}

              {/* Timeline de status */}
              {order.status_history && order.status_history.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm text-gray-400 mb-2">Histórico</h3>
                  <div className="space-y-2">
                    {order.status_history.map((h) => (
                      <div key={h.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-white/40 mt-1" />
                        <div>
                          <div className="text-sm font-medium">{h.status}</div>
                          <div className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</div>
                          {h.note && <div className="text-xs text-gray-300">{h.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Itens</h2>
          <div className="space-y-2">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((it: any) => (
                <div key={it.id} className="flex flex-col gap-2 bg-[#0f0f0f] p-3 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{it.product_name ?? 'Produto'}</div>
                      <div className="text-xs text-gray-400">Qtd: {it.quantity}</div>
                    </div>
                    <div className="text-sm text-gray-300">x{it.quantity}</div>
                  </div>
                  {it.options && it.options.length > 0 && (
                    <div className="text-xs text-gray-400 pl-2">
                      Adicionais: {it.options.map((o: any) => `${o.option_name}${o.quantity>1?` x${o.quantity}`:''}`).join(' • ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400">Sem itens</div>
            )}
          </div>
        </section>

        <div className="flex gap-2">
          <button onClick={() => router.push('/')} className="px-4 py-2 rounded-lg bg-white/10">Voltar</button>
          {settings?.whatsapp && (
            <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-green-600">Abrir WhatsApp</a>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
