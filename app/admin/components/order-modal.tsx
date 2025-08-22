'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OrderWithItems, supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { X, Hamburger } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const OrderMap = dynamic(
  () => import('@/components/order-map').then(mod => mod.OrderMap),
  { ssr: false }
)

const statusConfig = {
  pending: { actions: ['accept', 'reject'] as const },
  accepted: { actions: ['preparing'] as const },
  preparing: { actions: ['out_for_delivery'] as const },
  out_for_delivery: { actions: ['delivered'] as const },
  delivered: { actions: [] as const },
  rejected: { actions: [] as const },
  cancelled: { actions: [] as const },
}

interface OrderModalProps {
  selectedOrderId: string | null
  setSelectedOrderId: (id: string | null) => void
  selectedOrder: OrderWithItems | null
  loadingOrder: boolean
  refreshOrders: () => void
}

export default function OrderModal({
  selectedOrderId,
  setSelectedOrderId,
  selectedOrder,
  loadingOrder,
  refreshOrders,
}: OrderModalProps) {
  const [updating, setUpdating] = useState(false)

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const updateOrderStatus = async (orderId: string, action: string) => {
    const actionToStatus: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
      preparing: 'preparing',
      out_for_delivery: 'out_for_delivery',
      delivered: 'delivered',
    }

    const newStatus = actionToStatus[action]
    if (!newStatus) return toast.error('Ação inválida')

    setUpdating(true)
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)

    if (error) {
      toast.error(`Erro ao atualizar pedido: ${error.message}`)
    } else {
      toast.success(`Pedido marcado como "${newStatus}"`)
      setSelectedOrderId(null)
      refreshOrders()
    }
    setUpdating(false)
  }

  return (
    <AnimatePresence>
      {selectedOrderId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-lg border border-white/20 p-4 sm:p-6 text-white"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setSelectedOrderId(null)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-300 hover:text-white z-10 bg-black/30 rounded-full p-1 sm:p-2 transition-colors duration-200"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" strokeWidth={4} />
            </button>

            {/* Loading */}
            {loadingOrder ? (
              <div className="flex flex-col items-center justify-center py-10">
                <motion.div className="mb-4">
                  <Hamburger className="w-12 h-12 sm:w-16 sm:h-16 text-[#cc9b3b]" />
                </motion.div>
                <span className="text-base sm:text-lg font-bold text-[#cc9b3b]">Carregando...</span>
              </div>
            ) : selectedOrder ? (
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Cliente e endereço */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base">
                  <div>
                    <p className="text-gray-400">Cliente</p>
                    <p className="font-semibold text-base sm:text-lg">
                      {selectedOrder.profile?.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Telefone</p>
                    <p className="font-semibold text-base sm:text-lg">
                      {selectedOrder.profile?.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-semibold text-base sm:text-lg">
                      {formatPrice(selectedOrder.total_cents)}
                    </p>
                  </div>
                  {selectedOrder.delivery_address && (
                    <div>
                      <p className="text-gray-400">Endereço</p>
                      <p className="font-semibold text-base sm:text-lg">{selectedOrder.delivery_address}</p>
                    </div>
                  )}
                </div>

                {/* Itens */}
                <div className="bg-black/20 backdrop-blur-md rounded-lg p-2 sm:p-4 border border-white/10">
                  <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Itens</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-200 text-xs sm:text-sm max-h-40 sm:max-h-48 overflow-y-auto">
                    {selectedOrder.order_items.map((item) => (
                      <li key={item.id}>
                        {item.product?.name} x{item.quantity} — {formatPrice(item.unit_price_cents)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {statusConfig[selectedOrder.status as keyof typeof statusConfig].actions.map(
                    (action) => (
                      <Button
                        key={action}
                        onClick={() => updateOrderStatus(selectedOrder.id, action)}
                        className="capitalize text-xs sm:text-sm"
                        disabled={updating}
                      >
                        {action.replace(/_/g, ' ')}
                      </Button>
                    )
                  )}
                </div>

                {/* Mapa */}
                {selectedOrder.delivery_lat &&
                  selectedOrder.delivery_lng &&
                  selectedOrder.profile?.full_name && (
                    <div className="h-48 sm:h-64 rounded-lg overflow-hidden border border-white/20">
                      <OrderMap
                        latitude={selectedOrder.delivery_lat}
                        longitude={selectedOrder.delivery_lng}
                        customerName={selectedOrder.profile.full_name}
                      />
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-center py-6 sm:py-10 text-gray-400 text-sm sm:text-base">
                Nenhum pedido selecionado.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
