'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, CreditCard, Banknote, Smartphone, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GlassCard } from '@/components/ui/glass-card'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  address: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'pix']),
  changeFor: z.string().optional(),
  notes: z.string().optional(),
})

type CheckoutData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')
  
  const { state, clearCart } = useCart()
  const { user, profile } = useAuth()
  const router = useRouter()

  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      paymentMethod: 'cash'
    }
  })

  const paymentMethod = form.watch('paymentMethod')

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (state.items.length === 0) {
      router.push('/')
      return
    }
  }, [user, state.items, router])

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador')
      return
    }

    setLocationError('')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setUseCurrentLocation(true)
        toast.success('Localização capturada com sucesso!')
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationError('Erro ao obter localização. Verifique as permissões.')
        setUseCurrentLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const onSubmit = async (data: CheckoutData) => {
    if (!user) return

    setLoading(true)

    try {
      // Create order
      const orderData = {
        customer_id: user.id,
        status: 'pending',
        payment_method: data.paymentMethod,
        total_cents: state.total,
        notes: data.notes || null,
        customer_name: data.fullName,
        customer_phone: data.phone,
        delivery_address: data.address || null,
        delivery_lat: location?.lat || null,
        delivery_lng: location?.lng || null,
        change_for_cents: data.changeFor ? Math.round(parseFloat(data.changeFor) * 100) : null,
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = state.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_cents: item.product.price_cents
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      clearCart()
      toast.success('Pedido realizado com sucesso!')
      router.push(`/orders/success?orderId=${order.id}`)

    } catch (error: any) {
      toast.error('Erro ao processar pedido: ' + error.message)
    }

    setLoading(false)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center">
          <p className="text-white text-lg mb-4">Carrinho vazio</p>
          <Link href="/">
            <Button>Voltar ao cardápio</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Finalizar Pedido</h1>
              <p className="text-white/70">Complete os dados para entrega</p>
            </div>
          </div>

          {/* Order Summary */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Resumo do Pedido</h2>
            <div className="space-y-3 mb-4">
              {state.items.map(item => (
                <div key={item.product.id} className="flex justify-between text-white/90">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>{formatPrice(item.product.price_cents * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/15 pt-4 flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(state.total)}</span>
            </div>
          </GlassCard>

          {/* Checkout Form */}
          <GlassCard className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Dados Pessoais</h3>
                
                <Input
                  {...form.register('fullName')}
                  placeholder="Nome completo"
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/50"
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-400 text-sm">{form.formState.errors.fullName.message}</p>
                )}

                <Input
                  {...form.register('phone')}
                  placeholder="Telefone"
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/50"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-400 text-sm">{form.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Localização</h3>
                
                <Input
                  {...form.register('address')}
                  placeholder="Endereço (opcional)"
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/50"
                />

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={requestLocation}
                    className="w-full border-white/15 text-white hover:bg-white/10"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    {location ? 'Localização Capturada ✓' : 'Usar Minha Localização Atual'}
                  </Button>

                  {locationError && (
                    <p className="text-red-400 text-sm">{locationError}</p>
                  )}

                  {location && (
                    <p className="text-green-400 text-sm">
                      Localização salva para entrega precisa!
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Forma de Pagamento</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <label className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/15 bg-white/5'
                  }`}>
                    <input
                      type="radio"
                      value="cash"
                      {...form.register('paymentMethod')}
                      className="sr-only"
                    />
                    <Banknote className="w-6 h-6 text-white" />
                    <div>
                      <div className="text-white font-medium">Dinheiro</div>
                      <div className="text-white/70 text-sm">Pagamento na entrega</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/15 bg-white/5'
                  }`}>
                    <input
                      type="radio"
                      value="card"
                      {...form.register('paymentMethod')}
                      className="sr-only"
                    />
                    <CreditCard className="w-6 h-6 text-white" />
                    <div>
                      <div className="text-white font-medium">Cartão</div>
                      <div className="text-white/70 text-sm">Cartão na entrega (POS)</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                    paymentMethod === 'pix' 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-white/15 bg-white/5'
                  }`}>
                    <input
                      type="radio"
                      value="pix"
                      {...form.register('paymentMethod')}
                      className="sr-only"
                    />
                    <Smartphone className="w-6 h-6 text-white" />
                    <div>
                      <div className="text-white font-medium">PIX</div>
                      <div className="text-white/70 text-sm">Demonstração (fake)</div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'cash' && (
                  <Input
                    {...form.register('changeFor')}
                    type="number"
                    step="0.01"
                    placeholder="Troco para quanto? (opcional)"
                    className="bg-white/10 border-white/15 text-white placeholder:text-white/50"
                  />
                )}
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Observações</h3>
                <Textarea
                  {...form.register('notes')}
                  placeholder="Observações sobre o pedido (opcional)"
                  className="bg-white/10 border-white/15 text-white placeholder:text-white/50 resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-4 text-lg font-semibold"
              >
                {loading ? 'Processando...' : `Confirmar Pedido - ${formatPrice(state.total)}`}
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}