'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { CartDrawer } from '@/components/cart-drawer'
import { CartFab } from '@/components/cart-fab'
import { ProductModal } from '@/components/product-modal'
import Footer from '@/components/footer'
import { useAuth } from '@/lib/auth'
import Header from '@/components/header'
import { Hamburger } from 'lucide-react'
import { supabase, Product } from '@/lib/supabase'
import { toast } from 'sonner'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'classic' | 'black'>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { user, profile, signOut } = useAuth()

  const handleCardClick = (product: Product) => setSelectedProduct(product)
  const handleModalClose = () => setSelectedProduct(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar produtos')
      setLoading(false)
      return
    }

    setProducts(
      (data as Product[])
        .filter(p => p.active) // filtra apenas produtos ativos
        .map(p => ({
          ...p,
          original_price_cents: p.original_price_cents ?? p.price_cents,
          updated_at: p.updated_at ?? p.created_at,
          ingredients: p.ingredients ?? [],
          categories: p.categories ?? [],
        }))
    )
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesFilter = filter === 'all' || product.categories?.includes(filter)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#cc9b3b]">
        <motion.div className="mb-4" transition={{ repeat: Infinity, duration: 1 }}>
          <Hamburger className="w-16 h-16" />
        </motion.div>
        <span className="text-lg font-bold">Carregando...</span>
      </div>
    )
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

      <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {filteredProducts.length} produto{filteredProducts.length !== 1 && 's'} encontrado{filteredProducts.length !== 1 && 's'}
        </span>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | 'classic' | 'black')}
          className="
            bg-[#1a1a1a]
            text-gray-300
            border border-[#333333]
            rounded-full
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

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {filteredProducts.length > 0 ? (
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
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer"
                onClick={() => handleCardClick(product)}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : searchQuery.trim() !== '' ? (
          <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
            Nenhum produto encontrado para "{searchQuery}"
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
            Nenhum produto disponível
          </div>
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={handleModalClose}
        onUpdate={handleProductUpdate}
      />

      <CartFab onClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <Footer />
    </div>
  )
}