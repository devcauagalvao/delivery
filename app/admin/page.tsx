'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Hamburger, MapPin, Check, X, Truck, Utensils, Package, ArrowLeft } from 'lucide-react'

type Order = {
  id: string
  customer_name: string
  customer_phone: string
  total_cents: number
  status: string
  delivery_address: string | null
  payment_method: string
  delivery_lat: number | null
  delivery_lng: number | null
  notes: string | null
  created_at: string
}

type OrderItem = {
  id: string
  product_id: string
  quantity: number
  unit_price_cents: number
  subtotal_cents: number
  product?: { name: string }
}

type OrderWithItems = Order & { order_items: OrderItem[] }

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  preparing: 'Preparando',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
}

const STATUS_ACTIONS: Record<string, { label: string; next: string; icon: React.FC<any> }[]> = {
  pending: [
    { label: 'Aceitar', next: 'accepted', icon: Check },
    { label: 'Rejeitar', next: 'rejected', icon: X },
  ],
  accepted: [{ label: 'Preparar', next: 'preparing', icon: Utensils }],
  preparing: [{ label: 'Saiu para entrega', next: 'out_for_delivery', icon: Truck }],
  out_for_delivery: [{ label: 'Entregue', next: 'delivered', icon: Package }],
  delivered: [],
  rejected: [],
  cancelled: [],
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchOrders = async () => {
      if (!isMounted) return
      setLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(name))')
        .order('created_at', { ascending: false })

      if (!isMounted) return
      if (error) {
        toast.error('Erro ao carregar pedidos')
        setOrders([])
      } else {
        setOrders(data as OrderWithItems[])
      }
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()

    return () => {
      isMounted = false
      channel.unsubscribe()
    }
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      toast.error('Erro ao atualizar status')
    } else {
      toast.success('Status atualizado!')
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      )
      if (selectedOrder?.id === orderId) setSelectedOrder(null)
    }

    setUpdating(false)
  }

  const sortedOrders = [
    ...orders.filter((o) => o.status !== 'delivered'),
    ...orders.filter((o) => o.status === 'delivered'),
  ]

  function OrderModal({ order, onClose }: { order: OrderWithItems; onClose: () => void }) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#1f1f23] rounded-2xl shadow-2xl w-full max-w-lg p-6 relative text-white focus:outline-none focus:ring-4 focus:ring-[#cc9b3b]/50"
            initial={{ scale: 0.95, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 40 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cc9b3b] rounded"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-[#cc9b3b]">Pedido #{order.id.slice(0, 8)}</h2>

            <div className="space-y-2 text-gray-300 text-sm">
              <div><span className="font-semibold">Status:</span> {STATUS_LABELS[order.status]}</div>
              <div><span className="font-semibold">Cliente:</span> {order.customer_name}</div>
              <div><span className="font-semibold">Telefone:</span> {order.customer_phone}</div>
              <div><span className="font-semibold">Endereço:</span> {order.delivery_address || <span className="italic text-gray-400">Não informado</span>}</div>
              <div><span className="font-semibold">Pagamento:</span> {order.payment_method.toUpperCase()}</div>
              <div><span className="font-semibold">Total:</span> {formatPrice(order.total_cents)}</div>
              {order.notes && <div><span className="font-semibold">Observações:</span> {order.notes}</div>}
            </div>

            {order.delivery_lat && order.delivery_lng && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-[#cc9b3b]">
                  <MapPin className="w-4 h-4" /> Local da entrega
                </h3>
                <iframe
                  title="Mapa da entrega"
                  width="100%"
                  height={200}
                  className="rounded-lg border-2 border-[#cc9b3b]"
                  loading="lazy"
                  style={{ filter: 'grayscale(0.2)' }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.delivery_lng - 0.002},${order.delivery_lat - 0.002},${order.delivery_lng + 0.002},${order.delivery_lat + 0.002}&layer=mapnik&marker=${order.delivery_lat},${order.delivery_lng}`}
                />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${order.delivery_lat}&mlon=${order.delivery_lng}#map=18/${order.delivery_lat}/${order.delivery_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-[#cc9b3b] mt-1 underline"
                >
                  Ver no mapa
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {STATUS_ACTIONS[order.status]?.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.next}
                    disabled={updating}
                    onClick={() => updateOrderStatus(order.id, action.next)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${updating
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-[#cc9b3b] hover:bg-[#b88b30] text-black'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-[#cc9b3b] hover:text-[#b88b30] transition focus:outline-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-[#cc9b3b]">Administração de Pedidos</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Hamburger className="w-12 h-12 text-[#cc9b3b]" />
            <span className="mt-4 text-[#cc9b3b]">Carregando pedidos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOrders.length === 0 ? (
              <div className="text-center text-gray-400 col-span-full">Nenhum pedido encontrado.</div>
            ) : (
              sortedOrders.map((order) => {
                const isDelivered = order.status === 'delivered'
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl p-4 shadow-md cursor-pointer transition border border-[#2a2a2a] ${isDelivered
                      ? 'bg-[#1c1c1c] opacity-60 hover:opacity-70'
                      : 'bg-[#23232b] hover:shadow-lg'
                      }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-[#cc9b3b]">#{order.id.slice(0, 8)}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'pending'
                          ? 'bg-yellow-700 text-yellow-200'
                          : order.status === 'accepted'
                            ? 'bg-blue-700 text-blue-200'
                            : order.status === 'preparing'
                              ? 'bg-orange-700 text-orange-200'
                              : order.status === 'out_for_delivery'
                                ? 'bg-purple-700 text-purple-200'
                                : order.status === 'delivered'
                                  ? 'bg-green-700 text-green-200'
                                  : order.status === 'rejected'
                                    ? 'bg-red-700 text-red-200'
                                    : 'bg-gray-700 text-gray-200'
                          }`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div className={`text-sm ${isDelivered ? 'text-gray-400' : 'text-gray-300'} space-y-1`}>
                      <div><strong>Cliente:</strong> {order.customer_name}</div>
                      <div><strong>Telefone:</strong> {order.customer_phone}</div>
                      <div><strong>Endereço:</strong> {order.delivery_address || <span className="italic text-gray-400">Não informado</span>}</div>
                      <div><strong>Total:</strong> {formatPrice(order.total_cents)}</div>
                      <div><strong>Pagamento:</strong> {order.payment_method.toUpperCase()}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  )
}
