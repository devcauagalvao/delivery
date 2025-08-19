'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface CartFabProps {
  onClick: () => void
}

export function CartFab({ onClick }: CartFabProps) {
  const { itemCount, state } = useCart()

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
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, y: 100 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg z-30"
      >
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <motion.div
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {itemCount}
            </motion.div>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-90">{itemCount} itens</div>
            <div className="font-bold">{formatPrice(state.total)}</div>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  )
}