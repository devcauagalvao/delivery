'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import OrderSummary from './components/order-summary'
import CheckoutForm, { CheckoutData } from './components/checkout-form'
import { formatPrice } from './types'
import { ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')

  const { state, clearCart } = useCart()
  const { user, profile } = useAuth()
  const router = useRouter()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const totalCents = useMemo(
    () => state.items.reduce((acc, item) => acc + item.product.price_cents * item.quantity, 0),
    [state.items]
  )

  useEffect(() => {
    if (!user || state.items.length === 0) router.push('/')
  }, [user, state.items, router])

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador')
      return
    }
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        toast.success('Localização capturada!')
      },
      () => setLocationError('Erro ao obter localização. Permissões negadas.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (data: CheckoutData) => {
    if (!user?.id) return toast.error('Usuário não autenticado.')
    if (state.items.length === 0) return toast.error('Carrinho vazio.')
    if (!location && !data.address) return setLocationError('Informe endereço ou capture a localização.')

    setLoading(true)
    try {
      const orderPayload = {
        customer_id: user.id,
        status: 'pending',
        payment_method: data.paymentMethod,
        total_cents: totalCents,
        notes: data.notes || null,
        delivery_lat: location?.lat || null,
        delivery_lng: location?.lng || null,
        customer_name: data.fullName,
        customer_phone: data.phone.replace(/\D/g, ''),
        delivery_address: data.address || null,
        change_for_cents:
          data.paymentMethod === 'cash' && data.changeFor
            ? Math.round(parseFloat(data.changeFor) * 100)
            : null,
      }

      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single()

      if (orderError || !insertedOrder?.id) {
        throw orderError || new Error('Falha ao criar pedido')
      }

      const orderId = insertedOrder.id

      const orderItems = state.items.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_cents: item.product.price_cents,
        subtotal_cents: item.product.price_cents * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      await clearCart()
      toast.success('Pedido realizado com sucesso!')
      router.push(`/orders/success?orderId=${orderId}`)
    } catch (err: any) {
      console.error('[Checkout Error]', err)
      toast.error('Erro ao processar pedido: ' + (err?.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a]">
        <GlassCard className="p-8 text-center bg-[#1a1a1a] border border-white/20">
          <p className="text-white text-lg mb-4">Carrinho vazio</p>
          <Link href="/">
            <Button className="bg-[#e11d48] text-white hover:bg-[#be123c]">Voltar ao cardápio</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-[#1a1a1a]">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="default" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Finalizar Pedido</h1>
              <p className="text-white/70">Complete os dados para entrega</p>
            </div>
          </div>

          {/* Resumo do pedido */}
          <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white">
            <OrderSummary items={state.items} formatPrice={formatPrice} totalCents={totalCents} />
          </GlassCard>

          {/* Formulário */}
          <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white">
            <CheckoutForm
              defaultValues={{
                fullName: profile?.full_name || '',
                phone: profile?.phone || '',
                paymentMethod: 'cash',
              }}
              onSubmit={onSubmit}
              loading={loading}
              location={location}
              locationError={locationError}
              requestLocation={requestLocation}
            />
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}