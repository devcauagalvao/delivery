'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ChevronUp } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface CartFabProps {
  onClick: () => void
}

export function CartFab({ onClick }: CartFabProps) {
  const { itemCount, totalCents } = useCart()

  if (itemCount === 0) return null

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, y: 100, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, y: 100, opacity: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#cc9b3b] to-[#e0b85c] hover:from-[#e0b85c] hover:to-[#cc9b3b] text-black rounded-2xl shadow-2xl z-30 transition-all duration-300 overflow-hidden group"
      >
        <div className="flex items-center gap-3 px-5 py-4 font-bold">
          {/* Ícone do carrinho */}
          <motion.div
            className="relative"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShoppingCart className="w-6 h-6" />
            <motion.div
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </motion.div>
          </motion.div>

          {/* Informações */}
          <div className="flex flex-col items-end">
            <div className="text-xs opacity-90">{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
            <div className="text-base">{formatPrice(totalCents)}</div>
          </div>

          {/* Ícone de seta animada */}
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-1"
          >
            <ChevronUp className="w-4 h-4 opacity-70" />
          </motion.div>
        </div>
      </motion.button>
    </AnimatePresence>
  )
}