'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Truck, 
  Package, 
  X,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { OrderMap } from '@/components/order-map'
import { supabase, OrderWithItems } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const statusConfig = {
  pending: { 
    label: 'Novos Pedidos', 
    icon: Clock, 
    color: 'text-yellow-400 bg-yellow-500/20',
    actions: ['accept', 'reject']
  },
  accepted: { 
    label: 'Aceitos', 
    icon: CheckCircle, 
    color: 'text-green-400 bg-green-500/20',
    actions: ['preparing']
  },
  preparing: { 
    label: 'Em Preparo', 
    icon: ChefHat, 
    color: 'text-blue-400 bg-blue-500/20',
    actions: ['out_for_delivery']
  },
  out_for_delivery: { 
    label: 'Saiu para Entrega', 
    icon: Truck, 
    color: 'text-purple-400 bg-purple-500/20',
    actions: ['delivered']
  },
  delivered: { 
    label: 'Entregues', 
    icon: Package, 
    color: 'text-green-400 bg-green-500/20',
    actions: []
  },
  rejected: { 
    label: 'Recusados', 
    icon: X, 
    color: 'text-red-400 bg-red-500/20',
    actions: []
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    subscribeToOrderUpdates()
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        ),
        profile:profiles (*)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setOrders(data as OrderWithItems[])
    }

    setLoading(false)
  }

  const subscribeToOrderUpdates = () => {
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders'
        }, 
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Erro ao atualizar pedido')
    } else {
      toast.success('Status atualizado com sucesso!')
      setSelectedOrder(null)
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status)
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center p-6">
          <GlassCard className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Carregando pedidos...</p>
          </GlassCard>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-white/70">Gerencie todos os pedidos em tempo real</p>
          </motion.div>

          {/* Orders Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {Object.entries(statusConfig).map(([status, config], columnIndex) => {
              const columnOrders = getOrdersByStatus(status)
              const Icon = config.icon

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: columnIndex * 0.1 }}
                  className="space-y-4"
                >
                  {/* Column Header */}
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">{config.label}</h2>
                        <p className="text-white/70 text-sm">{columnOrders.length} pedidos</p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Orders */}
                  <div className="space-y-3">
                    {columnOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GlassCard 
                          className="p-4 cursor-pointer hover:bg-white/15"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-white font-medium">
                                #{order.id.slice(0, 8)}
                              </span>
                              <span className="text-white/70 text-sm">
                                {formatDate(order.created_at)}
                              </span>
                            </div>

                            <div className="text-white/90">
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-white/70">{order.customer_phone}</p>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-white font-bold">
                                {formatPrice(order.total_cents)}
                              </span>
                              <div className="flex items-center gap-1">
                                {order.payment_method === 'cash' && <Banknote className="w-4 h-4 text-white/70" />}
                                {order.payment_method === 'card' && <CreditCard className="w-4 h-4 text-white/70" />}
                                {order.payment_method === 'pix' && <Smartphone className="w-4 h-4 text-white/70" />}
                                {order.delivery_lat && <MapPin className="w-4 h-4 text-white/70" />}
                              </div>
                            </div>

                            <p className="text-white/70 text-sm">
                              {order.order_items?.length} itens
                            </p>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}

                    {columnOrders.length === 0 && (
                      <div className="text-center text-white/50 py-8">
                        Nenhum pedido
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Order Detail Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/15 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Pedido #{selectedOrder.id.slice(0, 8)}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Cliente</h3>
                      <p>{selectedOrder.customer_name}</p>
                      <p className="text-white/70">{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Pedido</h3>
                      <p className="text-white/70">{formatDate(selectedOrder.created_at)}</p>
                      <p className="font-bold text-lg">{formatPrice(selectedOrder.total_cents)}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Pagamento</h3>
                    <p className="flex items-center gap-2">
                      {selectedOrder.payment_method === 'cash' && <><Banknote className="w-4 h-4" /> Dinheiro</>}
                      {selectedOrder.payment_method === 'card' && <><CreditCard className="w-4 h-4" /> Cartão</>}
                      {selectedOrder.payment_method === 'pix' && <><Smartphone className="w-4 h-4" /> PIX</>}
                    </p>
                    {selectedOrder.change_for_cents && (
                      <p className="text-white/70">Troco para: {formatPrice(selectedOrder.change_for_cents)}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-2">Itens</h3>
                    <div className="space-y-2">
                      {selectedOrder.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between bg-white/5 p-3 rounded-xl">
                          <span>{item.quantity}x {item.product?.name}</span>
                          <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Observações</h3>
                      <p className="bg-white/5 p-3 rounded-xl">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Address */}
                  {selectedOrder.delivery_address && (
                    <div>
                      <h3 className="font-semibold mb-2">Endereço</h3>
                      <p className="bg-white/5 p-3 rounded-xl">{selectedOrder.delivery_address}</p>
                    </div>
                  )}

                  {/* Map */}
                  {selectedOrder.delivery_lat && selectedOrder.delivery_lng && (
                    <div>
                      <h3 className="font-semibold mb-2">Localização do Cliente</h3>
                      <OrderMap
                        latitude={selectedOrder.delivery_lat}
                        longitude={selectedOrder.delivery_lng}
                        customerName={selectedOrder.customer_name}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.actions.map(action => {
                      const actionLabels: Record<string, string> = {
                        accept: 'Aceitar Pedido',
                        reject: 'Recusar Pedido',
                        preparing: 'Iniciar Preparo',
                        out_for_delivery: 'Saiu para Entrega',
                        delivered: 'Marcar como Entregue'
                      }

                      const actionColors: Record<string, string> = {
                        accept: 'bg-green-500 hover:bg-green-600',
                        reject: 'bg-red-500 hover:bg-red-600',
                        preparing: 'bg-blue-500 hover:bg-blue-600',
                        out_for_delivery: 'bg-purple-500 hover:bg-purple-600',
                        delivered: 'bg-green-500 hover:bg-green-600'
                      }

                      return (
                        <Button
                          key={action}
                          onClick={() => updateOrderStatus(selectedOrder.id, action)}
                          className={`${actionColors[action]} text-white`}
                        >
                          {actionLabels[action]}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}