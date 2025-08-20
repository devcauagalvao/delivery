'use client'

import { Product } from '@/lib/supabase'
import { GlassCard } from './ui/glass-card'
import { Button } from './ui/button'
import { Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const handleAddToCart = () => {
    addItem(product)
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/5">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-black/30" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-black">{product.name}</h3>
        {product.description && (
          <p className="text-black/70 text-sm line-clamp-2">{product.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-black">
            {formatPrice(product.price_cents)}
          </span>
          {product.original_price_cents && product.original_price_cents > product.price_cents && (
            <span className="text-black/50 line-through text-sm">
              {formatPrice(product.original_price_cents)}
            </span>
          )}
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
          >
            <Plus className="w-5 h-5" strokeWidth={4} />
          </Button>
        </motion.div>
      </div>
    </GlassCard>
  )
}