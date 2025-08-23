'use client'

import { Product } from '@/lib/menu'
import { X, Plus, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem, state: cartState } = useCart()
  if (!product) return null

  const handleAddToCart = () => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      description: product.description,
      price_cents: product.price * 100,
      image_url: product.image,
      active: product.active ?? true,
      created_at: product.created_at ?? new Date().toISOString(),
      updated_at: product.updated_at ?? new Date().toISOString(),
    }

    addItem(productToAdd)
    toast(`${product.name} adicionado ao carrinho!`, {
      description: 'Você pode finalizar a compra no carrinho.',
      duration: 3000,
      icon: <CheckCircle className="text-white mr-2" />,
      className: 'bg-green-600 text-white border border-green-700',
    })
  }

  const alreadyInCart = cartState.items.some(item => item.product.id === product.id)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative flex flex-col md:flex-row w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white z-10 bg-black rounded-full p-2 transition-colors duration-200"
          >
            <X className="w-5 h-5" strokeWidth={4} />
          </button>

          {/* Imagem */}
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4">
            <div className="relative w-full h-72 md:h-[400px]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col justify-between p-6 md:w-1/2 text-gray-200">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{product.description}</p>

              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Ingredientes</h3>
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rodapé com preço e botão adicionar */}
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
              <p className="text-[#cc9b3b] font-bold text-lg">
                R$ {product.price.toFixed(2)}
              </p>

              <Button
                onClick={handleAddToCart}
                size="sm"
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                  alreadyInCart
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-gray-100'
                }`}
              >
                <Plus className="w-5 h-5" strokeWidth={4} />
                {alreadyInCart ? 'Adicionado' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
