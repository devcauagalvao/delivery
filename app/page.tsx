'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { supabase, Product } from '@/lib/supabase'
import { ProductCard } from '@/components/product-card'
import { CartDrawer } from '@/components/cart-drawer'
import { CartFab } from '@/components/cart-fab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { LogOut, Shield, LogIn } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name')

    if (data) setProducts(data)
    setLoading(false)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 animate-pulse">
                <div className="aspect-square bg-white/10 rounded-2xl mb-4" />
                <div className="h-6 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
                <div className="h-8 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/15"
      >
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Tauros Black Burgers
              </h1>
              <p className="text-black/70">Os melhores hambúrgueres da cidade</p>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-black/70">Olá, {profile?.full_name}</span>
                  {profile?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="admin">
                        <span className="flex items-center w-full">
                          <Shield className="w-4 h-4" />
                          <span className="ml-2 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                            Admin
                          </span>
                        </span>
                      </Button>
                    </Link>
                  )}
                  <Button variant="logout" onClick={signOut}>
                    <span className="flex items-center w-full">
                      <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={4} />
                      <span className="ml-2 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                        Sair
                      </span>
                    </span>
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button variant="login">
                    <span className="flex items-center w-full">
                      <LogIn className="w-4 h-4" />
                      <span className="ml-2 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                        Entrar
                      </span>
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
            <Input
              placeholder="Buscar hambúrgueres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/15 text-black placeholder:text-black/50"
            />
          </div>
        </div>
      </motion.header>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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

        {filteredProducts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-black/70 text-lg">
              Nenhum produto encontrado para "{searchQuery}"
            </p>
          </motion.div>
        )}
      </main>

      {/* Cart FAB */}
      <CartFab onClick={() => setCartOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}