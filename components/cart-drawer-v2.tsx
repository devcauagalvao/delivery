'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, Trash2, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/lib/auth'
import { Button } from './ui/button'
import { GlassCard } from './ui/glass-card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { state, updateQuantity, removeItem, totalCents, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)

  const handleCheckout = async () => {
    onClose()
    router.push('/checkout')
  }

  const deliveryEstimate = totalCents > 2500 ? 4.99 : 5.99
  const finalTotal = totalCents + Math.round(deliveryEstimate * 100)

  const itemKey = (it: any) => `${it.product_id}::${JSON.stringify(it.selectedOptions || [])}`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[#0a0a0a] border-l border-white/10 shadow-2xl overflow-y-auto"
          >
            <GlassCard className="h-full rounded-none border-0 p-6 space-y-4 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-[#cc9b3b]" />
                    Carrinho
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {state.items.length} item{state.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </motion.button>
              </div>

              {/* Conteúdo */}
              {state.items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-600" />
                  <p className="text-gray-400 text-center text-sm">Seu carrinho está vazio</p>
                  <Button onClick={onClose} variant="primary" size="md">
                    Voltar ao Cardápio
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de itens - scrollável */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {state.items.map((item) => {
                      const itemTotal = (item.unit_price_cents + (item.selectedOptions || []).reduce((s, o) => s + o.unit_price_cents * o.quantity, 0)) * item.quantity
                      return (
                        <motion.div
                          key={itemKey(item)}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex gap-3">
                            {/* Imagem (não armazenada no snapshot) */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-gray-600" />
                            </div>

                            {/* Detalhes */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm line-clamp-2">
                                {item.product_name}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatPrice(item.unit_price_cents)} cada
                              </p>
                              <p className="text-sm font-bold text-[#cc9b3b] mt-1">
                                {formatPrice(itemTotal)}
                              </p>
                              {item.selectedOptions && item.selectedOptions.length > 0 && (
                                <div className="mt-2 text-xs text-gray-400">
                                  {item.selectedOptions.map(opt => `${opt.option_name}${opt.quantity>1?` x${opt.quantity}`:''}`).join(' • ')}
                                </div>
                              )}
                            </div>

                            {/* Remover rápido */}
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.product_id, itemKey(item))}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* Quantidade */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-400">Qtd:</span>
                            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateQuantity(item.product_id, item.quantity - 1, itemKey(item))
                                }
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <Minus className="w-3 h-3 text-gray-400" />
                              </motion.button>

                              <span className="text-white font-semibold w-6 text-center text-sm">
                                {item.quantity}
                              </span>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateQuantity(item.product_id, item.quantity + 1, itemKey(item))
                                }
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-400" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Resumo */}
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalCents)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Entrega</span>
                      <span>~R$ {deliveryEstimate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-2">
                      <span>Total</span>
                      <span className="text-[#cc9b3b]">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Botão de checkout */}
                  <Button
                    onClick={handleCheckout}
                    size="xl"
                    className="w-full gap-2"
                  >
                    Finalizar Pedido
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  {/* Botão para limpar (secundário) */}
                  <Button
                    onClick={clearCart}
                    variant="destructive"
                    size="md"
                    className="w-full"
                  >
                    Limpar Carrinho
                  </Button>
                </>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
