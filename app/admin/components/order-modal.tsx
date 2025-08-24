import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Check, Utensils, Truck, Package } from 'lucide-react'
import { STATUS_LABELS, formatPrice, OrderWithItems } from '../page'

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

type OrderItem = OrderWithItems['items'][0]

export default function OrderModal({
  order,
  onClose,
  updating,
  updateOrderStatus,
}: {
  order: OrderWithItems
  onClose: () => void
  updating: boolean
  updateOrderStatus: (orderId: string, newStatus: string) => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#1f1f23] rounded-2xl shadow-2xl w-full max-w-lg p-6 relative text-white"
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold mb-4 text-[#cc9b3b]">
            Pedido #{order.id.slice(0, 8)}
          </h2>

          <div className="space-y-2 text-gray-300 text-sm">
            <div><span className="font-semibold">Status:</span> {STATUS_LABELS[order.status]}</div>
            <div><span className="font-semibold">Cliente:</span> {order.customer_name}</div>
            <div><span className="font-semibold">Telefone:</span> {order.customer_phone}</div>
            <div>
              <span className="font-semibold">Endereço:</span>{" "}
              {order.delivery_address || (
                <span className="italic text-gray-400">Não informado</span>
              )}
            </div>
            <div><span className="font-semibold">Pagamento:</span> {order.payment_method.toUpperCase()}</div>
            <div><span className="font-semibold">Total:</span> {formatPrice(order.total_cents)}</div>
            {order.notes && <div><span className="font-semibold">Observações:</span> {order.notes}</div>}
          </div>

          {/* Itens do Pedido */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-[#cc9b3b]">Itens do Pedido</h3>
            <div className="space-y-3">
              {(order.items || []).map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm border-b border-white/10 pb-1"
                >
                  <span>{item.product?.name || 'Produto desconhecido'}</span>
                  <span>Qtd: {item.quantity}</span>
                  <span>{formatPrice(item.subtotal_cents)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa (se houver localização) */}
          {order.delivery_lat && order.delivery_lng && (
            <div className="mb-4 mt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-[#cc9b3b]">
                <MapPin className="w-4 h-4" /> Local da entrega
              </h3>
              <iframe
                title="Mapa da entrega"
                width="100%"
                height={200}
                className="rounded-lg border-2 border-[#cc9b3b]"
                loading="lazy"
                style={{ filter: "grayscale(0.2)" }}
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

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2 mt-4">
            {STATUS_ACTIONS[order.status]?.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.next}
                  disabled={updating}
                  onClick={() => updateOrderStatus(order.id, action.next)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${updating
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-[#cc9b3b] hover:bg-[#b88b30] text-black"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}