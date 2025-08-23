'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { OrderWithItems } from '@/lib/supabase'

const statusConfig = {
  pending: { label: 'Novos', bg: 'bg-red-800', text: 'text-white' },
  accepted: { label: 'Aceitos', bg: 'bg-green-800', text: 'text-white' },
  preparing: { label: 'Em Preparo', bg: 'bg-yellow-800', text: 'text-black' },
  out_for_delivery: { label: 'Saiu para Entrega', bg: 'bg-purple-800', text: 'text-white' },
  delivered: { label: 'Entregues', bg: 'bg-gray-800', text: 'text-white' },
  rejected: { label: 'Recusados', bg: 'bg-gray-700', text: 'text-white' },
  cancelled: { label: 'Cancelados', bg: 'bg-gray-700', text: 'text-white' },
} as const

const orderCardColors = {
  pending: 'bg-red-700 text-white',
  accepted: 'bg-green-700 text-white',
  preparing: 'bg-yellow-200 text-black',
  out_for_delivery: 'bg-purple-700 text-white',
  delivered: 'bg-gray-700 text-white',
  rejected: 'bg-gray-600 text-white',
  cancelled: 'bg-gray-600 text-white',
} as const

interface OrdersTabProps {
  orders: OrderWithItems[]
  setSelectedOrderId: (id: string) => void
}

export default function OrdersTab({ orders, setSelectedOrderId }: OrdersTabProps) {
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const getOrdersByStatus = (status: keyof typeof statusConfig) =>
    orders.filter(order => order.status === status)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.keys(statusConfig).map(statusKey => {
        const status = statusKey as keyof typeof statusConfig
        const ordersByStatus = getOrdersByStatus(status)
        const statusData = statusConfig[status]

        return (
          <GlassCard
            key={status}
            className={`p-3 rounded-lg border border-gray-700 shadow-md ${statusData.bg} ${statusData.text}`}
          >
            <h3 className="font-semibold mb-3 text-md border-b border-gray-600 pb-1">
              {statusData.label} ({ordersByStatus.length})
            </h3>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
              {ordersByStatus.length === 0 && (
                <p className="text-sm text-gray-300 italic">Nenhum pedido</p>
              )}

              {ordersByStatus.map(order => (
                <GlassCard
                  key={order.id}
                  className={`p-3 rounded-md border border-gray-600 shadow hover:shadow-lg cursor-pointer transition ${orderCardColors[order.status]}`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm">{order.profile?.full_name || 'Cliente'}</p>
                    <p className="text-sm">{formatPrice(order.total_cents)}</p>
                  </div>

                  <ul className="mb-1 list-disc list-inside text-xs max-h-24 overflow-y-auto">
                    {order.order_items.map(item => (
                      <li key={item.id}>
                        {item.product?.name || 'Produto'} x{item.quantity} — {formatPrice(item.unit_price_cents)}
                      </li>
                    ))}
                  </ul>

                  <p className="text-[10px] text-gray-200 italic">Clique para mais detalhes</p>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
