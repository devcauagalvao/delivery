'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Package,
  X,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { supabase, OrderWithItems } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useDebounce } from '@/hooks/useDebounce'

// Carrega mapa apenas no cliente
const OrderMap = dynamic(() => import('@/components/order-map'), { ssr: false })

const statusConfig = {
  pending: { label: 'Novos', icon: Clock, color: 'text-red-500 bg-red-100', actions: ['accept', 'reject'] as const },
  accepted: { label: 'Aceitos', icon: CheckCircle, color: 'text-green-500 bg-green-100', actions: ['preparing'] as const },
  preparing: { label: 'Em Preparo', icon: ChefHat, color: 'text-yellow-500 bg-yellow-100', actions: ['out_for_delivery'] as const },
  out_for_delivery: { label: 'Saiu para Entrega', icon: Truck, color: 'text-purple-500 bg-purple-100', actions: ['delivered'] as const },
  delivered: { label: 'Entregues', icon: Package, color: 'text-gray-500 bg-gray-100', actions: [] as const },
  rejected: { label: 'Recusados', icon: X, color: 'text-gray-400 bg-gray-100', actions: [] as const },
  cancelled: { label: 'Cancelados', icon: X, color: 'text-gray-400 bg-gray-100', actions: [] as const }
}

type User = { id: string, full_name: string, phone: string, role: string, created_at: string }
type Product = { id: string, name: string, description?: string, price_cents: number, original_price_cents: number, image_url: string, active: boolean, created_at: string }
type OrderItem = { id: string, order_id: string, product_id: string, quantity: number, unit_price_cents: number, subtotal_cents?: number, product?: Product }

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [tab, setTab] = useState<'orders' | 'users' | 'products'>('orders')

  // Usuários
  const [users, setUsers] = useState<User[]>([])
  const [userFilter, setUserFilter] = useState({ name: '', phone: '', role: '' })
  const debouncedUserFilter = useDebounce(userFilter, 400)

  // Produtos
  const [products, setProducts] = useState<Product[]>([])
  const [productFilter, setProductFilter] = useState({ name: '', active: '' })
  const debouncedProductFilter = useDebounce(productFilter, 400)

  // Pedidos - filtros
  const [orderFilters, setOrderFilters] = useState({ status: '', payment: '', date: '' })

  // Carregar pedidos
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

  const updateOrderStatus = async (orderId: string, action: string) => {
    const actionToStatus: Record<string, string> = {
      accept: 'accepted', reject: 'rejected', preparing: 'preparing', out_for_delivery: 'out_for_delivery', delivered: 'delivered'
    }
    const newStatus = actionToStatus[action]
    if (!newStatus) return toast.error('Ação inválida')

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (error) toast.error('Erro ao atualizar pedido')
    else setSelectedOrderId(null)
  }

  const formatPrice = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR')
  const getOrdersByStatus = (status: string) => orders.filter(order => order.status === status)

  // Carregar usuários e produtos
  useEffect(() => {
    if (tab === 'users') fetchUsers()
    else if (tab === 'products') fetchProducts()
  }, [debouncedUserFilter, debouncedProductFilter, tab])

  const fetchUsers = async () => {
    let query = supabase.from('profiles').select('*')
    if (debouncedUserFilter.name) query = query.ilike('full_name', `%${debouncedUserFilter.name}%`)
    if (debouncedUserFilter.phone) query = query.ilike('phone', `%${debouncedUserFilter.phone}%`)
    if (debouncedUserFilter.role) query = query.eq('role', debouncedUserFilter.role)
    const { data, error } = await query
    if (!error) setUsers(data as User[])
  }

  const fetchProducts = async () => {
    let query = supabase.from('products').select('*')
    if (debouncedProductFilter.name) query = query.ilike('name', `%${debouncedProductFilter.name}%`)
    if (debouncedProductFilter.active) query = query.eq('active', debouncedProductFilter.active === 'true')
    const { data, error } = await query
    if (!error) setProducts(data as Product[])
  }

  const filteredOrders = orders.filter(order => {
    const statusOk = !orderFilters.status || order.status === orderFilters.status
    const paymentOk = !orderFilters.payment || order.payment_method === orderFilters.payment
    const dateOk = !orderFilters.date || order.created_at.startsWith(orderFilters.date)
    return statusOk && paymentOk && dateOk
  })

  if (loading) return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-600 via-red-900 to-gray-900">
        <GlassCard className="p-8 text-center bg-white/80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-700 font-semibold">Carregando pedidos...</p>
        </GlassCard>
      </div>
    </ProtectedRoute>
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen p-6 bg-gradient-to-br from-red-600 via-red-900 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <Tabs value={tab} onValueChange={v => setTab(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
            </TabsList>

            {/* PEDIDOS */}
            <TabsContent value="orders">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(statusConfig).map(status => (
                  <GlassCard key={status} className="p-4">
                    <h3 className="font-bold mb-2">{statusConfig[status as keyof typeof statusConfig].label}</h3>
                    <ul>
                      {getOrdersByStatus(status).map(order => (
                        <li key={order.id} className="border-b border-gray-200 py-2 flex justify-between items-center">
                          <span>{order.profile?.full_name} - {formatPrice(order.total_cents)}</span>
                          <Button size="sm" onClick={() => setSelectedOrderId(order.id)}>Detalhes</Button>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>

            {/* USUÁRIOS */}
            <TabsContent value="users">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input placeholder="Nome" value={userFilter.name} onChange={e => setUserFilter(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Telefone" value={userFilter.phone} onChange={e => setUserFilter(f => ({ ...f, phone: e.target.value }))} />
                  <Input placeholder="Role" value={userFilter.role} onChange={e => setUserFilter(f => ({ ...f, role: e.target.value }))} />
                </div>
                <div className="overflow-auto">
                  <table className="w-full table-auto text-left border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Nome</th>
                        <th className="border px-2 py-1">Telefone</th>
                        <th className="border px-2 py-1">Role</th>
                        <th className="border px-2 py-1">Criado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="border px-2 py-1">{u.full_name}</td>
                          <td className="border px-2 py-1">{u.phone}</td>
                          <td className="border px-2 py-1">{u.role}</td>
                          <td className="border px-2 py-1">{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* PRODUTOS */}
            <TabsContent value="products">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input placeholder="Nome" value={productFilter.name} onChange={e => setProductFilter(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Ativo" value={productFilter.active} onChange={e => setProductFilter(f => ({ ...f, active: e.target.value }))} />
                </div>
                <div className="overflow-auto">
                  <table className="w-full table-auto text-left border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Nome</th>
                        <th className="border px-2 py-1">Preço</th>
                        <th className="border px-2 py-1">Ativo</th>
                        <th className="border px-2 py-1">Criado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td className="border px-2 py-1">{p.name}</td>
                          <td className="border px-2 py-1">{formatPrice(p.price_cents)}</td>
                          <td className="border px-2 py-1">{p.active ? 'Sim' : 'Não'}</td>
                          <td className="border px-2 py-1">{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* MODAL PEDIDO */}
        <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
            </DialogHeader>
            {loadingOrder ? (
              <p>Carregando...</p>
            ) : selectedOrder ? (
              <div className="flex flex-col gap-4">
                <p>Cliente: {selectedOrder.profile?.full_name}</p>
                <p>Telefone: {selectedOrder.profile?.phone}</p>
                <p>Total: {formatPrice(selectedOrder.total_cents)}</p>
                <div>
                  {selectedOrder.order_items.map(item => (
                    <p key={item.id}>{item.product?.name} x{item.quantity} - {formatPrice(item.unit_price_cents)}</p>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {statusConfig[selectedOrder.status as keyof typeof statusConfig].actions.map(action => (
                    <Button key={action} onClick={() => updateOrderStatus(selectedOrder.id, action)}>
                      {action}
                    </Button>
                  ))}
                </div>
                <div className="h-64 mt-4">
                  <OrderMap order={selectedOrder} />
                </div>
              </div>
            ) : (
              <p>Nenhum pedido selecionado.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
