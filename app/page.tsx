 'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import dynamic from 'next/dynamic'
const CartDrawer = dynamic(() => import('@/components/cart-drawer').then(m => m.CartDrawer), { ssr: false })
import { CartFab } from '@/components/cart-fab'
const ProductModal = dynamic(() => import('@/components/product-modal').then(m => m.ProductModal), { ssr: false })
import { RestaurantHeader, CategoryMenu } from '@/components/restaurant-header'
import Footer from '@/components/footer'
import { useAuth } from '@/lib/auth'
import Header from '@/components/header'
import { MenuCategory, MenuProduct } from '@/lib/menu'
import { useMenu } from '@/hooks/use-menu'
import { toast } from 'sonner'
import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const { data: menu = [], loading, error, retry } = useMenu()
  const [menuState, setMenuState] = useState<MenuCategory[]>(menu)

  // keep local menuState in sync with remote menu when it updates
  useEffect(() => {
    if (menu && menu.length > 0) setMenuState(menu)
  }, [menu])
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)

  const { user, profile, signOut } = useAuth()

  const handleCardClick = (product: MenuProduct) => setSelectedProduct(product)
  const handleModalClose = () => setSelectedProduct(null)

  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar produtos')
    }
  }, [error])

  const handleProductUpdate = (updatedProduct: MenuProduct) => {
    setMenuState(prev => prev.map(cat => ({ ...cat, products: cat.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) })))
  }

  // Extrair categorias únicas dos produtos
  const categories = ['Todos', ...menuState.map(c => c.name)]

  // Filtrar produtos por categoria e search
  const allProducts = React.useMemo(() => menuState.flatMap(c => c.products.map(p => ({ ...p, category: menuState.find(cat => cat.products.some(pp => pp.id === p.id))?.name || '' }))), [menuState])

  const filteredProducts = React.useMemo(() => allProducts.filter(product => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(q) || (product.description?.toLowerCase().includes(q) ?? false)
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory
    return matchesSearch && matchesCategory
  }), [allProducts, searchQuery, activeCategory])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          profile={profile}
          signOut={signOut}
        />
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        profile={profile}
        signOut={signOut}
      />

      {/* Informações do restaurante */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <RestaurantHeader
          info={{
            name: 'Taurus Black Burger',
            logo: '/taurus-black-burguer/logo-taurus.png',
            status: 'open',
            openingHour: '11:00',
            closingHour: '23:00',
            averagePrepTime: 20,
            deliveryFee: 499,
            minimumOrder: 2500,
          }}
        />
      </div>

      {/* Busca móvel: use o campo no Header para mobile */}

      {/* Menu de categorias sticky */}
      {categories.length > 1 && (
        <CategoryMenu
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      )}

      {/* Grid de produtos */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
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
                onClick={() => handleCardClick(product)}
              >
                <ProductCard product={product as any} />
              </motion.div>
            ))}
          </motion.div>
        ) : searchQuery.trim() !== '' ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">Nenhum produto encontrado para "{searchQuery}"</p>
            <p className="text-sm mt-2">Tente buscar por outro termo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg">Nenhum produto disponível nesta categoria</p>
          </div>
        )}
      </main>

      <ProductModal
        product={selectedProduct as any}
        onClose={handleModalClose}
        onUpdate={handleProductUpdate as any}
      />

      <CartFab onClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <Footer />
    </div>
  )
}