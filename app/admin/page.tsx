'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Hamburger, ArrowLeft } from 'lucide-react'
import OrderList from './components/order-list'
import OrderModal from './components/order-modal'

// Tipos e constantes (pode mover para um arquivo types.ts se quiser)
type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
  product?: {
    name: string;
  };
}

export type OrderWithItems = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string | null;
  payment_method: string;
  total_cents: number;
  notes?: string | null;
  status: string;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  items: OrderItem[];
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  preparing: 'Preparando',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
}

export function formatPrice(cents: number) {
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
        // Ajuste para garantir que items venha corretamente
        const ordersWithItems = (data as any[]).map((order) => ({
          ...order,
          items: order.order_items || [],
        }))
        setOrders(ordersWithItems)
      }

      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
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

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* TOPO DA PÁGINA */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-[#cc9b3b] hover:text-[#b88b30] transition focus:outline-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-[#cc9b3b]">Administração de Pedidos</h1>
        </div>

        {/* LISTA DE PEDIDOS */}
        <OrderList
          loading={loading}
          orders={sortedOrders}
          onSelectOrder={setSelectedOrder}
        />
      </div>

      {/* MODAL DE DETALHES DO PEDIDO */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          updating={updating}
          updateOrderStatus={updateOrderStatus}
        />
      )}
    </div>
  )
}