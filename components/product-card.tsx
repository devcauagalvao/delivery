'use client'

import type { Product as SupabaseProduct } from "@/lib/supabase"
import { Button } from './ui/button'
import { Plus, ShoppingBag, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Image from 'next/image'
import React from 'react'

interface ProductCardProps {
  product: SupabaseProduct
  onSelect?: () => void
}

const MemoizedProductCard = ({ product, onSelect }: ProductCardProps) => {
  const { addItem, state: cartState } = useCart()

  const formatPrice = (price_cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price_cents / 100)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()

    // If product has option groups, open modal instead of quick-add
    if ((product as any).option_groups && (product as any).option_groups.length > 0) {
      if (onSelect) onSelect()
      return
    }

    addItem(product)

    toast.success(`${product.name} adicionado ao carrinho!`, {
      duration: 2000,
    })
  }

  const alreadyInCart = cartState.items.some(item => item.product_id === product.id && (!item.selectedOptions || item.selectedOptions.length === 0))

  // Calcular desconto se houver (tratando nullable)
  const originalPrice = product.original_price_cents ?? product.price_cents
  const hasDiscount = originalPrice > product.price_cents
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - product.price_cents) / originalPrice) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="group rounded-2xl overflow-hidden bg-[#111111] border border-white/10 hover:border-white/20 shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Imagem */}
      <div className="relative w-full h-52 sm:h-56 md:h-48 bg-[#1a1a1a]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#111111]">
            <ShoppingBag className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge de desconto */}
        {hasDiscount && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold"
          >
            -{discountPercentage}%
          </motion.div>
        )}

        {/* destaque removido — categorias agora vêm via product_categories no servidor */}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-3">
        {/* Nome e descrição */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Preço + Botão */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col gap-1">
            <span className="text-lg sm:text-xl font-bold text-white">
              {formatPrice(product.price_cents)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            size="icon-lg"
            variant={alreadyInCart ? 'secondary' : 'primary'}
            className="rounded-full transition-all"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export const ProductCard = React.memo(MemoizedProductCard)
