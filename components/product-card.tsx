'use client'

import type { Product as MenuProduct } from "@/lib/menu"
import type { Product as SupabaseProduct } from "@/lib/supabase"
import { Button } from './ui/button'
import { Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProductCardProps {
  product: MenuProduct
}

// Converte MenuProduct em SupabaseProduct
const mapMenuToSupabaseProduct = (product: MenuProduct): SupabaseProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price_cents: product.price * 100,
  image_url: product.image,
  active: product.active,
  created_at: product.created_at,
  updated_at: product.updated_at,
})

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleAddToCart = () => {
    const supabaseProduct = mapMenuToSupabaseProduct(product)
    addItem(supabaseProduct)
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="rounded-3xl overflow-hidden bg-[#111111] border border-[#222222] shadow-md transition-all duration-300"
    >
      {/* Imagem */}
      <div className="relative w-full h-52 sm:h-60 md:h-64 lg:h-56 xl:h-60">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#222222]">
            <ShoppingBag className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-3">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-200">{product.name}</h3>
          {product.description && (
            <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
          )}
        </div>

        {/* Preço + botão */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl sm:text-2xl font-bold text-gray-200">
            {formatPrice(product.price)}
          </span>

          <Button
            onClick={handleAddToCart}
            size="sm"
            className="bg-[#880000] hover:bg-[#aa0000] text-gray-100 rounded-full p-3 shadow-md transition-all"
          >
            <Plus className="w-5 h-5" strokeWidth={4} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
