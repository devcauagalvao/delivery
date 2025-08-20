'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, LogOut, LogIn } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { CartDrawer } from '@/components/cart-drawer'
import { CartFab } from '@/components/cart-fab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { menu, Product } from '@/lib/menu'
import Image from 'next/image'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'classic' | 'black'>('all')
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    setProducts(menu)
    setLoading(false)
  }, [])

  const filteredProducts = products.filter(product => {
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
      {/* Header */}
      <motion.header className="sticky top-0 z-20 w-full border-b border-[#222222] bg-[#111111]/60 backdrop-blur-md backdrop-saturate-150">
        <div className="w-full px-4 sm:px-6 md:px-8 py-4 flex items-center gap-4">
          {/* Logo */}
          <div className="w-36 sm:w-40 md:w-48 flex-shrink-0">
            <Image
              src="/taurus-black-burguer/logo-taurus.png"
              alt="Logo Taurus Black Burgers"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          {/* Search bar centralizada e moderna */}
          <div className="flex-1 mx-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200" />
            <Input
              placeholder="Buscar hambúrgueres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
    pl-12 pr-4 h-12 w-full
    bg-[#1a1a1a] 
    border border-[#333333] 
    text-gray-200 placeholder:text-gray-500
    rounded-xl 
    shadow-inner
    focus:border-[#cc9b3b] 
    focus:ring-4 focus:ring-[#cc9b3b] 
    focus-visible:outline-none
    transition-all duration-200
  "
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {user ? (
              <>
                <span className="text-gray-400 hidden sm:inline">Olá, {profile?.full_name}</span>

                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="admin">
                      <Shield className="w-5 h-5 shrink-0" strokeWidth={4} />
                      <span className="absolute left-11 opacity-0 whitespace-nowrap text-sm transition-opacity duration-200 group-hover:opacity-100">
                        Admin
                      </span>
                    </Button>
                  </Link>
                )}

                <Button onClick={signOut} variant="logout">
                  <LogOut className="w-5 h-5 shrink-0" strokeWidth={4} />
                  <span className="absolute left-11 opacity-0 whitespace-nowrap text-sm transition-opacity duration-200 group-hover:opacity-100">
                    Sair
                  </span>
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="login">
                  <LogIn className="w-5 h-5 shrink-0" strokeWidth={4} />
                  <span className="absolute left-11 opacity-0 whitespace-nowrap text-sm transition-opacity duration-200 group-hover:opacity-100">
                    Entrar
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Filtro de categorias em dropdown no canto superior direito */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {filteredProducts.length} produto{filteredProducts.length !== 1 && 's'} encontrado{filteredProducts.length !== 1 && 's'}
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
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* FAB + Drawer */}
      <CartFab onClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
