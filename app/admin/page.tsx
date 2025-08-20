'use client'

import { useState, useEffect } from 'react'
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
import { OrderMap } from '@/components/order-map'
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
import { useDebounce } from '@/hooks/useDebounce' // Supondo hook de debounce

const statusConfig = {
  pending: {
    label: 'Novos',
    icon: Clock,
    color: 'text-red-500 bg-red-100',
    actions: ['accept', 'reject'] as const
  },
  accepted: {
    label: 'Aceitos',
    icon: CheckCircle,
    color: 'text-green-500 bg-green-100',
    actions: ['preparing'] as const
  },
  preparing: {
    label: 'Em Preparo',
    icon: ChefHat,
    color: 'text-yellow-500 bg-yellow-100',
    actions: ['out_for_delivery'] as const
  },
  out_for_delivery: {
    label: 'Saiu para Entrega',
    icon: Truck,
    color: 'text-purple-500 bg-purple-100',
    actions: ['delivered'] as const
  },
  delivered: {
    label: 'Entregues',
    icon: Package,
    color: 'text-gray-500 bg-gray-100',
    actions: [] as const
  },
  rejected: {
    label: 'Recusados',
    icon: X,
    color: 'text-gray-400 bg-gray-100',
    actions: [] as const
  },
  cancelled: {
    label: 'Cancelados',
    icon: X,
    color: 'text-gray-400 bg-gray-100',
    actions: [] as const
  }
}

type User = {
  id: string
  full_name: string
  phone: string
  role: string
  created_at: string
}

type Product = {
  id: string
  name: string
  description: string
  price_cents: number
  original_price_cents: number
  image_url: string
  active: boolean
  created_at: string
}

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

  useEffect(() => {
    fetchOrders()
    const unsubscribe = subscribeToOrderUpdates()
    return unsubscribe
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        ),
        profile:profiles (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar pedidos')
      setLoading(false)
      return
    }

    setOrders(data as OrderWithItems[])
    setLoading(false)
  }

  const fetchOrderById = async (orderId: string) => {
    setLoadingOrder(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        ),
        profile:profiles (*)
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      toast.error('Erro ao carregar detalhes do pedido')
      setSelectedOrder(null)
    } else {
      setSelectedOrder(data as OrderWithItems)
    }
    setLoadingOrder(false)
  }

  useEffect(() => {
    if (selectedOrderId) fetchOrderById(selectedOrderId)
    else setSelectedOrder(null)
  }, [selectedOrderId])

  const subscribeToOrderUpdates = () => {
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()
    return () => subscription.unsubscribe()
  }

  const updateOrderStatus = async (orderId: string, action: string) => {
    // Mapeamento de action para status real do pedido
    const actionToStatus: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
      preparing: 'preparing',
      out_for_delivery: 'out_for_delivery',
      delivered: 'delivered'
    }
    const newStatus = actionToStatus[action]
    if (!newStatus) return toast.error('Ação inválida')

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) toast.error('Erro ao atualizar pedido')
    else {
      toast.success('Status atualizado com sucesso!')
      setSelectedOrderId(null)
    }
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('pt-BR')

  const getOrdersByStatus = (status: string) =>
    orders.filter(order => order.status === status)

  // Carregar usuários
  useEffect(() => {
    if (tab !== 'users') return
    const fetchUsers = async () => {
      let query = supabase.from('profiles').select('*')
      if (debouncedUserFilter.name)
        query = query.ilike('full_name', `%${debouncedUserFilter.name}%`)
      if (debouncedUserFilter.phone)
        query = query.ilike('phone', `%${debouncedUserFilter.phone}%`)
      if (debouncedUserFilter.role)
        query = query.eq('role', debouncedUserFilter.role)
      const { data, error } = await query
      if (!error) setUsers(data as User[])
    }
    fetchUsers()
  }, [debouncedUserFilter, tab])

  // Carregar produtos
  useEffect(() => {
    if (tab !== 'products') return
    const fetchProducts = async () => {
      let query = supabase.from('products').select('*')
      if (debouncedProductFilter.name)
        query = query.ilike('name', `%${debouncedProductFilter.name}%`)
      if (debouncedProductFilter.active)
        query = query.eq('active', debouncedProductFilter.active === 'true')
      const { data, error } = await query
      if (!error) setProducts(data as Product[])
    }
    fetchProducts()
  }, [debouncedProductFilter, tab])

  // Filtros de pedidos
  const filteredOrders = orders.filter(order => {
    const statusOk = !orderFilters.status || order.status === orderFilters.status
    const paymentOk = !orderFilters.payment || order.payment_method === orderFilters.payment
    const dateOk = !orderFilters.date || order.created_at.startsWith(orderFilters.date)
    return statusOk && paymentOk && dateOk
  })

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-600 via-red-900 to-gray-900">
          <GlassCard className="p-8 text-center bg-white/80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-red-700 font-semibold">Carregando pedidos...</p>
          </GlassCard>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen p-6 bg-gradient-to-br from-red-600 via-red-900 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
            </TabsList>

            {/* Pedidos */}
            <TabsContent value="orders">
              <div className="flex gap-4 mb-6 flex-wrap">
                <select
                  className="rounded px-2 py-1"
                  value={orderFilters.status}
                  onChange={e => setOrderFilters(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="">Todos Status</option>
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <select
                  className="rounded px-2 py-1"
                  value={orderFilters.payment}
                  onChange={e => setOrderFilters(f => ({ ...f, payment: e.target.value }))}
                >
                  <option value="">Todas Formas</option>
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                  <option value="pix">PIX</option>
                </select>
                <Input
                  type="date"
                  value={orderFilters.date}
                  onChange={e => setOrderFilters(f => ({ ...f, date: e.target.value }))}
                  className="w-auto"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
                {Object.entries(statusConfig).map(([status, config], colIndex) => {
                  const columnOrders = getOrdersByStatus(status)
                  const Icon = config.icon
                  return (
                    <motion.div key={status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIndex * 0.1 }} className="space-y-4">
                      <GlassCard className={`p-4 shadow-lg border-2 border-white/10 bg-white/90`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${config.color} shadow`}><Icon className="w-5 h-5" /></div>
                          <div>
                            <h2 className="font-semibold text-gray-900 text-lg">{config.label}</h2>
                            <p className="text-gray-600 text-sm">{columnOrders.length} pedidos</p>
                          </div>
                        </div>
                      </GlassCard>

                      <div className="space-y-3">
                        {columnOrders.map((order, index) => (
                          <motion.div key={order.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                            <GlassCard
                              className={`p-4 cursor-pointer transition-all border-2 ${
                                selectedOrderId === order.id
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-transparent bg-white/80 hover:bg-red-100'
                              }`}
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-red-700 font-bold text-base">#{order.id.slice(0, 8)}</span>
                                  <span className="text-gray-500 text-xs">{formatDate(order.created_at)}</span>
                                </div>
                                <div className="text-gray-900">
                                  <p className="font-semibold">{order.customer_name}</p>
                                  <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-red-700 font-bold text-lg">{formatPrice(order.total_cents)}</span>
                                  <div className="flex items-center gap-1">
                                    {order.payment_method === 'cash' && <Banknote className="w-4 h-4 text-gray-700" />}
                                    {order.payment_method === 'card' && <CreditCard className="w-4 h-4 text-gray-700" />}
                                    {order.payment_method === 'pix' && <Smartphone className="w-4 h-4 text-gray-700" />}
                                    {order.delivery_lat && <MapPin className="w-4 h-4 text-red-500" />}
                                  </div>
                                </div>
                                <p className="text-gray-500 text-xs">{order.order_items?.length} itens</p>
                              </div>
                            </GlassCard>
                          </motion.div>
                        ))}
                        {columnOrders.length === 0 && <div className="text-center text-gray-400 py-8 italic">Nenhum pedido</div>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Usuários */}
            <TabsContent value="users">
              <div className="flex gap-4 mb-6 flex-wrap">
                <Input
                  placeholder="Nome"
                  value={userFilter.name}
                  onChange={e => setUserFilter(f => ({ ...f, name: e.target.value }))}
                  className="w-auto"
                />
                <Input
                  placeholder="Telefone"
                  value={userFilter.phone}
                  onChange={e => setUserFilter(f => ({ ...f, phone: e.target.value }))}
                  className="w-auto"
                />
                <select
                  className="rounded px-2 py-1"
                  value={userFilter.role}
                  onChange={e => setUserFilter(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="">Todas Funções</option>
                  <option value="admin">Admin</option>
                  <option value="user">Usuário</option>
                  {/* Adicione outros papéis se houver */}
                </select>
              </div>
              <div className="bg-white/80 rounded-xl shadow p-4">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Função</th>
                      <th>Criado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.phone}</td>
                        <td>{user.role}</td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <Button size="sm" onClick={() => {/* abrir modal de edição */}}>Editar</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <div className="text-center text-gray-400 py-8 italic">Nenhum usuário encontrado</div>}
              </div>
            </TabsContent>

            {/* Produtos */}
            <TabsContent value="products">
              <div className="flex gap-4 mb-6 flex-wrap">
                <Input
                  placeholder="Nome do produto"
                  value={productFilter.name}
                  onChange={e => setProductFilter(f => ({ ...f, name: e.target.value }))}
                  className="w-auto"
                />
                <select
                  className="rounded px-2 py-1"
                  value={productFilter.active}
                  onChange={e => setProductFilter(f => ({ ...f, active: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
                <Button onClick={() => {/* abrir modal de novo produto */}}>Novo Produto</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <GlassCard key={product.id} className="p-4 flex flex-col gap-2">
                    <img src={product.image_url} alt={product.name} className="h-32 object-cover rounded mb-2" />
                    <div className="font-bold">{product.name}</div>
                    <div className="text-gray-600 text-sm">{product.description}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-700 font-bold">{formatPrice(product.price_cents)}</span>
                      {product.original_price_cents > product.price_cents && (
                        <span className="line-through text-gray-400">{formatPrice(product.original_price_cents)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.active}
                        onCheckedChange={async (checked) => {
                          await supabase.from('products').update({ active: checked }).eq('id', product.id)
                          setProducts(ps => ps.map(p => p.id === product.id ? { ...p, active: checked } : p))
                        }}
                      />
                      <span className={product.active ? 'text-green-600' : 'text-gray-400'}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <Button size="sm" onClick={() => {/* abrir modal de edição */}}>Editar</Button>
                  </GlassCard>
                ))}
                {products.length === 0 && <div className="text-center text-gray-400 py-8 italic col-span-full">Nenhum produto encontrado</div>}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Pedido */}
        <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-red-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {loadingOrder ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                <p className="text-red-700">Carregando pedido...</p>
              </div>
            ) : selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-700">
                    <Package className="w-6 h-6 text-red-500" />
                    Pedido <span className="text-red-500">#{selectedOrder.id.slice(0, 8)}</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-700">Cliente</h3>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                      <p className="text-gray-500 text-sm">{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-700">Pedido</h3>
                      <p className="text-gray-500 text-sm">{formatDate(selectedOrder.created_at)}</p>
                      <p className="font-bold text-lg text-red-700">{formatPrice(selectedOrder.total_cents)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-gray-700">Pagamento</h3>
                    <p className="flex items-center gap-2">
                      {selectedOrder.payment_method === 'cash' && <><Banknote className="w-4 h-4" /> Dinheiro</>}
                      {selectedOrder.payment_method === 'card' && <><CreditCard className="w-4 h-4" /> Cartão</>}
                      {selectedOrder.payment_method === 'pix' && <><Smartphone className="w-4 h-4" /> PIX</>}
                    </p>
                    {selectedOrder.change_for_cents && <p className="text-gray-500 text-sm">Troco para: {formatPrice(selectedOrder.change_for_cents)}</p>}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-gray-700">Itens</h3>
                    <div className="space-y-2">
                      {selectedOrder.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between bg-red-100 p-3 rounded-xl text-gray-900">
                          <span>{item.quantity}x {item.product?.name}</span>
                          <span>{formatPrice(item.subtotal_cents ?? item.unit_price_cents * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-700">Observações</h3>
                      <p className="bg-red-50 p-3 rounded-xl text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {selectedOrder.delivery_address && (
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-700">Endereço</h3>
                      <p className="bg-red-50 p-3 rounded-xl text-gray-700">{selectedOrder.delivery_address}</p>
                    </div>
                  )}

                  {selectedOrder.delivery_lat && selectedOrder.delivery_lng && (
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-700">Localização do Cliente</h3>
                      <OrderMap latitude={selectedOrder.delivery_lat} longitude={selectedOrder.delivery_lng} customerName={selectedOrder.customer_name} />
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap mt-4">
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.actions.map(action => {
                      const actionLabels: Record<string, string> = {
                        accept: 'Aceitar Pedido',
                        reject: 'Recusar Pedido',
                        preparing: 'Iniciar Preparo',
                        out_for_delivery: 'Saiu para Entrega',
                        delivered: 'Marcar como Entregue'
                      }
                      const actionColors: Record<string, string> = {
                        accept: 'bg-red-600 hover:bg-red-700',
                        reject: 'bg-gray-400 hover:bg-gray-500',
                        preparing: 'bg-yellow-500 hover:bg-yellow-600',
                        out_for_delivery: 'bg-purple-500 hover:bg-purple-600',
                        delivered: 'bg-green-600 hover:bg-green-700'
                      }
                      return <Button key={action} onClick={() => updateOrderStatus(selectedOrder.id, action)} className={`${actionColors[action]} text-white font-semibold shadow-md`}>{actionLabels[action]}</Button>
                    })}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
