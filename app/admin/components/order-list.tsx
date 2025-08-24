import { Hamburger } from 'lucide-react'
import OrderCard from './order-card'
import type { OrderWithItems } from '../page'

export default function OrderList({
    loading,
    orders,
    onSelectOrder,
}: {
    loading: boolean
    orders: OrderWithItems[]
    onSelectOrder: (order: OrderWithItems) => void
}) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Hamburger className="w-12 h-12 text-[#cc9b3b]" />
                <span className="mt-4 text-[#cc9b3b]">Carregando pedidos...</span>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center text-gray-400 col-span-full">Nenhum pedido encontrado.</div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={() => onSelectOrder(order)} />
            ))}
        </div>
    )
}