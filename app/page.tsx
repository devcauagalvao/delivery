'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { CartDrawer } from '@/components/cart-drawer'
import { CartFab } from '@/components/cart-fab'
import { ProductModal } from '@/components/product-modal'
import { menu, Product } from '@/lib/menu'
import { useAuth } from '@/lib/auth'
import Header from '../components/header'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'classic' | 'black'>('all')

  const { user, profile, signOut } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const handleCardClick = (product: Product) => setSelectedProduct(product)
  const handleModalClose = () => setSelectedProduct(null)

  useEffect(() => {
    setProducts(menu)
    setLoading(false)
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter =
      filter === 'all' ||
      (filter === 'classic' && product.name.toLowerCase().includes('clássico')) ||
      (filter === 'black' && product.name.toLowerCase().includes('black'))
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <div className="p-6 bg-black text-gray-300 min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-black text-gray-300">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        profile={profile}
        signOut={signOut}
      />

      {/* Filtro de categorias em dropdown no canto superior direito */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {filteredProducts.length} produto{filteredProducts.length !== 1 && 's'} encontrado
          {filteredProducts.length !== 1 && 's'}
        </span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'classic' | 'black')}
          className="
            bg-[#1a1a1a]
            text-gray-300
            border border-[#333333]
            rounded-md
            px-4 py-2
            focus:outline-none
            focus:ring-1 focus:ring-[#cc9b3b]
            transition-all duration-200
          "
        >
          <option value="all">Todos</option>
          <option value="classic">Burgers Clássicos</option>
          <option value="black">Black Burgers</option>
        </select>
      </div>

      {/* Products */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(product)}
              className="cursor-pointer"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <ProductModal product={selectedProduct} onClose={handleModalClose} />

      {/* FAB + Drawer */}
      <CartFab onClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
