'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/lib/auth'
import { createOrder, insertOrderItems, applyCoupon } from '@/lib/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import OrderSummary from './components/order-summary'
import CheckoutForm, { CheckoutData } from './components/checkout-form'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')
  const [couponCode, setCouponCode] = useState('')

  const { state, clearCart } = useCart()
  const { profile } = useAuth() // guest flow: profile may be null but we don't write to profiles
  const router = useRouter()

  const [settings, setSettings] = useState<any | null>(null)

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const totalCents = useMemo(
    () => state.items.reduce((acc, item) => acc + item.unit_price_cents * item.quantity + (item.selectedOptions || []).reduce((s,o)=>s + o.unit_price_cents * o.quantity,0), 0),
    [state.items]
  )

  useEffect(() => {
    if (state.items.length === 0) router.push('/')
  }, [state.items, router])

  useEffect(() => {
    let mounted = true
    import('@/lib/settings').then(({ getSettings }) => {
      getSettings().then(s => { if (mounted) setSettings(s) }).catch(() => {})
    })
    return () => { mounted = false }
  }, [])

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
    if (state.items.length === 0) return toast.error('Carrinho vazio.')
    if (!location && !data.address) return setLocationError('Informe endereço ou capture a localização.')

    setLoading(true)
    try {
      if (!data.fullName || !data.phone) {
        setLoading(false)
        return toast.error('Nome e telefone são obrigatórios')
      }

      const idempotencyKey = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : undefined

      // Prevent checkout when store closed
      if (settings && settings.is_open === false) {
        throw new Error('A loja está fechada no momento')
      }

      const orderResp = await createOrder({
        customer_name: data.fullName,
        customer_phone: data.phone.replace(/\D/g, ''),
        is_delivery: !!(data.address || location),
        delivery_address: data.address || null,
        delivery_notes: data.deliveryNotes || null,
        payment_method: data.paymentMethod,
        notes: data.notes || null,
        change_for_cents:
          data.paymentMethod === 'cash' && data.changeFor
            ? Math.round(parseFloat(data.changeFor) * 100)
            : null,
        idempotency_key: idempotencyKey || null,
      })

      const orderId = orderResp.id
      if (!orderId) throw new Error('Não foi possível criar pedido')

      // Prepare cart items with snapshots and options
      const itemsPayload = state.items.map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        unit_price_cents: it.unit_price_cents,
        quantity: it.quantity,
        item_notes: it.item_notes ?? null,
        selectedOptions: it.selectedOptions || [],
      }))

      await insertOrderItems(orderId, itemsPayload as any)

      // If coupon provided, call RPC and refresh order (server computes totals)
      if (couponCode && couponCode.trim().length > 0) {
        try {
          await applyCoupon(orderId, couponCode.trim())
        } catch (couponErr: any) {
          // show message but don't abort after items inserted
          toast.error('Cupom inválido ou não aplicável: ' + (couponErr?.message || ''))
        }
      }

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a1a] text-[#cc9b3b] p-6">
        <ShoppingCart size={64} className="mb-4" />
        <p className="text-xl mb-6">Carrinho vazio</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/">
              <Button variant="default" size="sm">
                <ArrowLeft className="w-8 h-8 text-[#cc9b3b]" strokeWidth={4} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#cc9b3b]">Finalizar Pedido</h1>
              <p className="text-[#cc9b3b]">Complete os dados para entrega</p>
            </div>
          </div>

          {/* Conteúdo lado a lado */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Esquerda: Resumo do pedido */}
            <div className="lg:w-1/2">
              <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white">
                <h2 className="text-xl font-semibold mb-4 text-[#cc9b3b]">Produtos do Pedido</h2>
                <OrderSummary items={state.items} formatPrice={formatPrice} totalCents={totalCents} />
              </GlassCard>
            </div>

            {/* Direita: Formulário */}
            <div className="lg:w-1/2">
              <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white">
                <h2 className="text-xl font-semibold mb-4 text-[#cc9b3b]">Informações para Entrega</h2>
                <CheckoutForm
                  defaultValues={{
                    fullName: profile?.full_name || '',
                    phone: profile?.phone || '',
                    address: profile?.address || '',
                    paymentMethod: 'cash',
                  }}
                  onSubmit={onSubmit}
                  loading={loading}
                  location={location}
                  locationError={locationError}
                  requestLocation={requestLocation}
                />
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}