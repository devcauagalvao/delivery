'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, ChefHat, Truck, Package } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { supabase, OrderWithItems } from '@/lib/supabase'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

const statusIcons = {
  pending: Clock,
  accepted: CheckCircle,
  preparing: ChefHat,
  out_for_delivery: Truck,
  delivered: Package,
  rejected: Package
}

const statusTexts = {
  pending: 'Aguardando confirmação',
  accepted: 'Pedido aceito!',
  preparing: 'Em preparo',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Pedido cancelado'
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    fetchOrder()
    subscribeToOrderUpdates()
  }, [orderId])

  const fetchOrder = async () => {
    if (!orderId) return

    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (data) {
      setOrder(data as OrderWithItems)
    }

    setLoading(false)
  }

  const subscribeToOrderUpdates = () => {
    if (!orderId) return

    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, 
        (payload) => {
          const updatedOrder = payload.new as any
          setOrder(prev => prev ? { ...prev, ...updatedOrder } : null)
          
          if (updatedOrder.status === 'accepted') {
            toast.success('Seu pedido foi aceito! 🎉')
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando pedido...</p>
        </GlassCard>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center">
          <p className="text-white text-lg mb-4">Pedido não encontrado</p>
          <Link href="/">
            <Button>Voltar ao cardápio</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success Header */}
          <GlassCard className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                order.status === 'rejected' ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                <StatusIcon className={`w-8 h-8 ${
                  order.status === 'rejected' ? 'text-red-400' : 'text-green-400'
                }`} />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2">
              {order.status === 'rejected' ? 'Pedido Cancelado' : 'Pedido Confirmado!'}
            </h1>
            <p className="text-white/70 mb-6">
              Pedido #{order.id.slice(0, 8)}
            </p>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              order.status === 'rejected' 
                ? 'bg-red-500/20 text-red-400' 
                : order.status === 'delivered'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              <StatusIcon className="w-5 h-5" />
              {statusTexts[order.status]}
            </div>
          </GlassCard>

          {/* Order Details */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Detalhes do Pedido</h2>
            
            <div className="space-y-3 mb-6">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-white/90">
                  <span>{item.quantity}x {item.product?.name}</span>
                  <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/15 pt-4">
              <div className="flex justify-between text-white font-bold text-lg mb-4">
                <span>Total</span>
                <span>{formatPrice(order.total_cents)}</span>
              </div>

              <div className="space-y-2 text-white/70 text-sm">
                <p><strong>Pagamento:</strong> {
                  order.payment_method === 'cash' ? 'Dinheiro' :
                  order.payment_method === 'card' ? 'Cartão' : 'PIX'
                }</p>
                
                {order.change_for_cents && (
                  <p><strong>Troco para:</strong> {formatPrice(order.change_for_cents)}</p>
                )}
                
                {order.notes && (
                  <p><strong>Observações:</strong> {order.notes}</p>
                )}

                <p><strong>Contato:</strong> {order.customer_phone}</p>
              </div>
            </div>
          </GlassCard>

          {/* Status Timeline */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Status do Pedido</h2>
            
            <div className="space-y-4">
              {['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].map((status, index) => {
                const isActive = order.status === status
                const isPassed = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) > index
                const Icon = statusIcons[status as keyof typeof statusIcons]
                
                return (
                  <div key={status} className={`flex items-center gap-3 ${
                    isActive ? 'text-blue-400' : isPassed ? 'text-green-400' : 'text-white/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-500/20' : isPassed ? 'bg-green-500/20' : 'bg-white/10'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{statusTexts[status as keyof typeof statusTexts]}</span>
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-2 h-2 bg-blue-400 rounded-full ml-auto"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </GlassCard>

          <div className="text-center">
            <Link href="/">
              <Button variant="secondary" className="border-white/15 text-white hover:bg-white/10">
                Voltar ao Cardápio
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}