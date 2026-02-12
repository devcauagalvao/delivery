'use client'

import { motion } from 'framer-motion'

/**
 * Skeleton Loader - Para areas em carregamento
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-lg ${className}`}
      animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  )
}

/**
 * Skeleton para card de produto
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-[#111111] border border-[#222222] space-y-4 p-4">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Skeleton Grid para múltiplos produtos
 */
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para item do carrinho
 */
export function CartItemSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl p-4 flex gap-3">
      <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  )
}

/**
 * Skeleton para timeline de status
 */
export function StatusTimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para resumo do pedido
 */
export function OrderSummarySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
      <div className="border-t border-white/20 pt-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}
