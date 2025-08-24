'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/lib/auth' // Hook de autenticação
import { Button } from './ui/button'
import { GlassCard } from './ui/glass-card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { state, updateQuantity, removeItem, totalCents } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)

  const handleCheckout = () => {
    onClose()
    if (!user) {
      router.push('/auth') // redireciona para login se não estiver autenticado
    } else {
      router.push('/checkout') // vai para checkout se estiver logado
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 shadow-none"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50"
          >
            <GlassCard className="h-full rounded-none rounded-l-3xl p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Carrinho</h2>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onClose}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Conteúdo do Carrinho */}
              {state.items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-white/30 mb-4" />
                  <p className="text-white/70 text-center">
                    Seu carrinho está vazio
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 overflow-auto">
                    {state.items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/5 rounded-2xl p-4"
                      >
                        <div className="flex gap-3">
                          {/* Imagem do Produto */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5">
                            {item.product.image_url ? (
                              <Image
                                src={item.product.image_url}
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-white/30" />
                              </div>
                            )}
                          </div>

                          {/* Detalhes do Produto */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-white/70 text-sm">
                              {formatPrice(item.product.price_cents)}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              {/* Quantidade */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="w-8 h-8 p-0 text-white/70 hover:text-white"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>

                                <span className="text-white font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>

                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="w-8 h-8 p-0 text-white/70 hover:text-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Remover item */}
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => removeItem(item.product.id)}
                                className="w-8 h-8 p-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total e Checkout */}
                  <div className="border-t border-white/15 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-semibold text-white">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(totalCents)}
                      </span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-3 transition-colors duration-200"
                    >
                      Finalizar Pedido
                    </Button>
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
