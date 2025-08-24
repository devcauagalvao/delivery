// filepath: [order-summary.tsx](http://_vscodecontentref_/4)
import Image from 'next/image'
import type { CartItem } from '../types'

type Props = {
  items: CartItem[]
  formatPrice: (cents: number) => string
  totalCents: number
}

export default function OrderSummary({ items, formatPrice, totalCents }: Props) {
  return (
    <div className="space-y-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Produtos do Pedido</h2>
      {items.map((item) => (
        <div key={item.product.id} className="flex items-center gap-4 border-b border-white/20 pb-3">
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 bg-[#111]">
            <Image
              src={item.product.image_url || '/placeholder.png'}
              alt={item.product.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{item.product.name}</span>
              <span className="text-[#cc9b3b]">{formatPrice(item.product.price_cents)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-white/70">Qtd: {item.quantity}</span>
              <span className="font-bold text-[#cc9b3b]">
                {formatPrice(item.product.price_cents * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      ))}
      <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-[#cc9b3b] text-lg">
        <span>Total</span>
        <span>{formatPrice(totalCents)}</span>
      </div>
    </div>
  )
}