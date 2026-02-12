"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface OrderSummary {
  id: string
  status: string
  total_cents?: number
  payment_method?: string
  created_at?: string
}

export default function OrdersListPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total_cents, payment_method, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setOrders((data as OrderSummary[]) || [])
      } catch (err) {
        console.error(err)
        toast.error('Não foi possível carregar seus pedidos')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const formatPrice = (cents?: number) =>
    cents == null
      ? 'R$ 0,00'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header searchQuery="" setSearchQuery={() => {}} user={user} profile={null} signOut={async () => {}} />

      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Meus Pedidos</h1>

        {loading ? (
          <div>Carregando...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400">Nenhum pedido encontrado.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="block bg-[#111] border border-white/10 rounded-xl p-4 hover:bg-[#161616]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Pedido #{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-400">{new Date(o.created_at || '').toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatPrice(o.total_cents)}</div>
                    <div className="text-xs text-gray-400">{o.status}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
