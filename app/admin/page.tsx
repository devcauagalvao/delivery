'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hamburger, X, Home, Menu } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { supabase, OrderWithItems } from '@/lib/supabase'
import { toast } from 'sonner'

import OrdersTab from './components/orders-tab'
import UsersTab from './components/users-tab'
import ProductsTab from './components/products-tab'
import OrderModal from './components/order-modal'

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tab, setTab] = useState<'orders' | 'users' | 'products'>('orders')

  useEffect(() => {
    fetchOrders()
    if (typeof window !== 'undefined') subscribeToOrderUpdates()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items (*, product:products (*)), profile:profiles (*)`)
      .order('created_at', { ascending: false })

    if (error) toast.error('Erro ao carregar pedidos')
    else setOrders(data as OrderWithItems[])
    setLoading(false)
  }

  const fetchOrderById = async (orderId: string) => {
    setLoadingOrder(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items (*, product:products (*)), profile:profiles (*)`)
      .eq('id', orderId)
      .single()

    if (error) {
      toast.error('Erro ao carregar detalhes do pedido')
      setSelectedOrder(null)
    } else setSelectedOrder(data as OrderWithItems)
    setLoadingOrder(false)
  }

  useEffect(() => {
    if (selectedOrderId) fetchOrderById(selectedOrderId)
    else setSelectedOrder(null)
  }, [selectedOrderId])

  const subscribeToOrderUpdates = () => {
    if (typeof window === 'undefined') return
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => subscription.unsubscribe()
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
          <motion.div className="mb-4">
            <Hamburger className="w-16 h-16" />
          </motion.div>
          <span className="text-lg font-bold">Carregando...</span>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-black relative">
        {/* Botão abrir sidebar */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Conteúdo principal */}
        <div className="p-6 max-w-7xl mx-auto">
          {tab === 'orders' && <OrdersTab orders={orders} setSelectedOrderId={setSelectedOrderId} />}
          {tab === 'users' && <UsersTab />}
          {tab === 'products' && <ProductsTab />}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Sidebar */}
              <motion.div
                className="fixed top-0 left-0 h-full w-80 bg-black text-white shadow-2xl z-50 flex flex-col"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
              >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-300 hover:text-white p-1 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 text-[#cc9b3b] hover:text-white"
                  >
                    <Home className="w-5 h-5" />
                    Principal
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-col flex-1 overflow-y-auto">
                  <div className="flex space-x-2 p-4 border-b border-white/20">
                    <button
                      onClick={() => setTab('orders')}
                      className={`px-3 py-1 rounded-md ${tab === 'orders' ? 'bg-black text-[#cc9b3b]' : 'text-white'}`}
                    >
                      Pedidos
                    </button>
                    <button
                      onClick={() => setTab('users')}
                      className={`px-3 py-1 rounded-md ${tab === 'users' ? 'bg-black text-[#cc9b3b]' : 'text-white'}`}
                    >
                      Usuários
                    </button>
                    <button
                      onClick={() => setTab('products')}
                      className={`px-3 py-1 rounded-md ${tab === 'products' ? 'bg-black text-[#cc9b3b]' : 'text-white'}`}
                    >
                      Produtos
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Order Modal */}
        <OrderModal
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          selectedOrder={selectedOrder}
          loadingOrder={loadingOrder}
          refreshOrders={fetchOrders}
        />
      </div>
    </ProtectedRoute>
  )
}
  