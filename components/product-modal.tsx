'use client'

import { SupabaseProduct } from "@/lib/supabase"
import { X, Plus, Minus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { useState } from 'react'
import { GlassCard } from './ui/glass-card'

interface ProductModalProps {
  product: any | null // MenuProduct (includes option_groups)
  onClose: () => void
  onUpdate?: (updatedProduct: any) => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem, state: cartState } = useCart()
  const [quantity, setQuantity] = useState(1)

  // selections: { [option_group_id]: { [option_id]: number } }
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({})

  if (!product) return null

  const formatPrice = (price_cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      price_cents / 100
    )
  }

  const totalPrice = product.price_cents * quantity
  const originalPrice = product.original_price_cents ?? product.price_cents
  const hasDiscount = originalPrice > product.price_cents
  const discountAmount = hasDiscount ? (originalPrice - product.price_cents) * quantity : 0

  // helper to count selected options for a group
  const countSelected = (groupId: string) => {
    const group = selections[groupId] || {}
    return Object.values(group).reduce((s, v) => s + (v || 0), 0)
  }

  const toggleOption = (groupId: string, optionId: string) => {
    setSelections((prev) => {
      const group = { ...(prev[groupId] || {}) }
      if (group[optionId]) {
        delete group[optionId]
      } else {
        group[optionId] = 1
      }
      return { ...prev, [groupId]: group }
    })
  }

  const validateGroups = (): { ok: boolean; message?: string } => {
    const groups = product.option_groups || []
    for (const g of groups) {
      const selected = countSelected(g.id)
      const min = g.min_select ?? 0
      const max = g.max_select ?? Infinity
      if ((g.required || min > 0) && selected < min) {
        return { ok: false, message: `Escolha ao menos ${min} opção(ões) para "${g.name}"` }
      }
      if (selected > max) {
        return { ok: false, message: `Escolha no máximo ${max} opção(ões) para "${g.name}"` }
      }
    }

    return { ok: true }
  }

  const buildSelectedOptions = () => {
    const out: any[] = []
    const groups = product.option_groups || []
    for (const g of groups) {
      const groupSel = selections[g.id] || {}
      for (const [optId, qty] of Object.entries(groupSel)) {
        const opt = g.options.find((o: any) => o.id === optId)
        if (opt) {
          out.push({ option_id: opt.id, option_name: opt.name, unit_price_cents: opt.unit_price_cents, quantity: qty })
        }
      }
    }
    return out
  }

  const handleAddToCart = () => {
    const validation = validateGroups()
    if (!validation.ok) {
      toast.error(validation.message)
      return
    }

    const selectedOptions = buildSelectedOptions()

    addItem({
      product_id: product.id,
      product_name: product.name,
      unit_price_cents: product.price_cents,
      quantity,
      item_notes: null,
      selectedOptions,
    })

    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`, { duration: 2000 })
    setQuantity(1)
    setSelections({})
    onClose()
  }

  const alreadyInCart = cartState.items.some(i => i.product_id === product.id && (!i.selectedOptions || i.selectedOptions.length === 0))

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard
              variant="elevated"
              className="w-full max-w-2xl pointer-events-auto rounded-3xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Imagem */}
                <div className="bg-[#111111] flex items-center justify-center p-6 md:p-8 min-h-96">
                  <div className="relative w-full h-80">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        Sem imagem
                      </div>
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col p-6 md:p-8 gap-4">
                  {/* Fechar */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="self-end text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>

                  {/* Nome e descrição */}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">{product.name}</h2>
                    {product.description && (
                      <p className="text-gray-300 text-base leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Option groups (se houver) */}
                  {product.option_groups && product.option_groups.length > 0 && (
                    <div className="space-y-4 border-t border-white/10 pt-4">
                      {product.option_groups.map((g: any) => {
                        const selectedCount = countSelected(g.id)
                        const max = g.max_select ?? Infinity
                        const min = g.min_select ?? 0
                        return (
                          <div key={g.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold text-white">{g.name} {g.required ? <span className="text-xs text-red-400">*</span> : null}</div>
                                <div className="text-xs text-gray-400">Escolha {min > 0 ? `mín ${min}` : 'opcional'}{isFinite(max) ? ` • máx ${max}` : ''}</div>
                              </div>
                              <div className="text-xs text-gray-300">{selectedCount}/{isFinite(max) ? max : '∞'}</div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {g.options.map((opt: any) => {
                                const isSelected = !!(selections[g.id] && selections[g.id][opt.id])
                                const disabled = !isSelected && selectedCount >= max
                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() => !disabled && toggleOption(g.id, opt.id)}
                                    className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'border-[#cc9b3b] bg-[#cc9b3b]/10 text-white' : 'border-white/10 text-gray-300'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/20'}`}
                                  >
                                    <div className="text-sm font-medium text-left">
                                      <div>{opt.name}</div>
                                      {opt.unit_price_cents > 0 && (
                                        <div className="text-xs text-gray-400">{formatPrice(opt.unit_price_cents)}</div>
                                      )}
                                    </div>
                                    <div className="text-sm">
                                      {isSelected ? <span className="text-sm text-[#cc9b3b]">Selecionado</span> : <span className="text-xs text-gray-400">Adicionar</span>}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Ingredientes removidos — dados de ingredientes não fazem parte do novo schema */}

                  {/* Preço com desconto */}
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-[#cc9b3b]">
                        {formatPrice(totalPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(originalPrice * quantity)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-xs text-green-400">
                        Economize {formatPrice(discountAmount)}
                      </p>
                    )}
                  </div>

                  {/* Espaço flex */}
                  <div className="flex-1" />

                  {/* Quantidade */}
                  <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                    <span className="text-sm font-medium text-gray-300 flex-1">
                      Quantidade
                    </span>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-400" />
                      </motion.button>
                      <span className="text-lg font-bold text-white w-8 text-center">
                        {quantity}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <Button
                    onClick={handleAddToCart}
                    size="xl"
                    className="w-full gap-2"
                  >
                    {alreadyInCart && <Check className="w-5 h-5" />}
                    Adicionar ao Carrinho ({quantity})
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}