import { STATUS_LABELS, formatPrice, OrderWithItems } from '../page'

export default function OrderCard({
    order,
    onClick,
}: {
    order: OrderWithItems
    onClick: () => void
}) {
    const isDelivered = order.status === 'delivered'

    return (
        <div
            className={`rounded-xl p-4 shadow-md cursor-pointer transition border border-[#2a2a2a] ${isDelivered ? 'bg-[#1c1c1c] opacity-60 hover:opacity-70' : 'bg-[#23232b] hover:shadow-lg'
                }`}
            onClick={onClick}
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
                <div>
                    <strong>Cliente:</strong> {order.customer_name}
                </div>
                <div>
                    <strong>Endereço:</strong>{' '}
                    {order.delivery_address || <span className="italic text-gray-400">Não informado</span>}
                </div>
                <div>
                    <strong>Total:</strong> {formatPrice(order.total_cents)}
                </div>

                <div className="mt-2">
                    <strong>Itens:</strong>
                    <ul className="ml-4 list-disc max-h-24 overflow-auto text-xs">
                        {(order.items || []).map((item) => (
                            <li key={item.id}>
                                {item.product?.name || 'Produto desconhecido'} — Qtd: {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
