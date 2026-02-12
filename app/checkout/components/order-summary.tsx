// filepath: [order-summary.tsx](http://_vscodecontentref_/4)
import Image from 'next/image'
import type { CartItem } from '../types'

type Props = {
  items: any[]
  formatPrice: (cents: number) => string
  totalCents: number
  couponCode?: string
  setCouponCode?: (v: string) => void
}

export default function OrderSummary({ items, formatPrice, totalCents, couponCode, setCouponCode }: Props) {
  return (
    <div className="space-y-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Produtos do Pedido</h2>
      {items.map((item) => (
        <div key={item.product_id || item.product?.id} className="flex items-center gap-4 border-b border-white/20 pb-3">
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 bg-[#111] flex items-center justify-center">
            {/* image not persisted in cart snapshot; show placeholder */}
            <Image
              src={item.product_image_url || (item.product && item.product.image_url) || '/placeholder.png'}
              alt={item.product_name || item.product?.name || 'Produto'}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{item.product_name || item.product?.name}</span>
              <span className="text-[#cc9b3b]">{formatPrice(item.unit_price_cents)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-white/70">Qtd: {item.quantity}</span>
              <span className="font-bold text-[#cc9b3b]">
                {formatPrice((item.unit_price_cents + (item.selectedOptions || []).reduce((s:any,o:any)=>s + o.unit_price_cents*o.quantity,0)) * item.quantity)}
              </span>
            </div>
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">Adicionais: {item.selectedOptions.map(o => o.option_name).join(', ')}</div>
            )}
          </div>
        </div>
      ))}

      {/* Cupom */}
      {typeof setCouponCode === 'function' && (
        <div className="mt-2">
          <label className="text-sm text-gray-400">Cupom</label>
          <div className="flex gap-2 mt-2">
            <input
              value={couponCode || ''}
              onChange={(e) => setCouponCode && setCouponCode(e.target.value)}
              placeholder="Código do cupom"
              className="flex-1 bg-[#111] border border-white/10 rounded-2xl px-4 py-2 text-white"
            />
            <button className="px-4 py-2 rounded-2xl bg-[#cc9b3b] text-black">Aplicar</button>
          </div>
        </div>
      )}

      <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-[#cc9b3b] text-lg">
        <span>Total</span>
        <span>{formatPrice(totalCents)}</span>
      </div>
    </div>
  )
}