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
import Image from 'next/image'

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
    if (!user) router.push('/auth')
    if (state.items.length === 0) router.push('/')
  }, [user, state.items, router])

  // Captura de localização do usuário
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador')
      return
    }
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setUseCurrentLocation(true)
        toast.success('Localização capturada com sucesso!')
      },
      (error) => {
        setLocationError('Erro ao obter localização. Verifique as permissões.')
        setUseCurrentLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const onSubmit = async (data: CheckoutData) => {
    if (!user) return
    if (state.items.length === 0) {
      toast.error('Carrinho vazio')
      return
    }
    if (!location) {
      setLocationError('É obrigatório capturar sua localização para entrega.')
      return
    }

    setLoading(true)
    try {
      const orderItems = state.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_cents: item.product.price_cents,
        subtotal_cents: item.product.price_cents * item.quantity
      }))

      const totalCents = orderItems.reduce((acc, item) => acc + item.subtotal_cents, 0)

      const { data: ordersData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: user.id,
          status: 'pending',
          payment_method: data.paymentMethod,
          total_cents: totalCents,
          notes: data.notes || null,
          customer_name: data.fullName,
          customer_phone: data.phone,
          delivery_address: data.address || null,
          delivery_lat: location?.lat || null,
          delivery_lng: location?.lng || null,
          change_for_cents: data.changeFor ? Math.round(parseFloat(data.changeFor) * 100) : null,
        }])
        .select('id')

      if (orderError) throw orderError
      if (!ordersData || ordersData.length === 0) throw new Error('Pedido não retornou ID')

      const orderId = ordersData[0].id

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems.map(item => ({ ...item, order_id: orderId })))

      if (itemsError) throw itemsError

      clearCart()
      toast.success('Pedido realizado com sucesso!')
      router.push(`/orders/success?orderId=${orderId}`)

    } catch (error: any) {
      toast.error('Erro ao processar pedido: ' + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <GlassCard className="p-8 text-center bg-white border border-neutral-200">
          <p className="text-black text-lg mb-4">Carrinho vazio</p>
          <Link href="/">
            <Button className="bg-[#e11d48] text-white hover:bg-[#be123c]">Voltar ao cardápio</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-black/70 hover:text-[#e11d48]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-black">Finalizar Pedido</h1>
              <p className="text-black/70">Complete os dados para entrega</p>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <GlassCard className="p-6 bg-white border border-neutral-200">
            <h2 className="text-xl font-semibold text-black mb-4">Produtos do Pedido</h2>
            <div className="space-y-4 mb-4">
              {state.items.map(item => (
                <div key={item.product.id} className="flex items-center gap-4 border-b border-neutral-100 pb-3">
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                    <Image
                      src={item.product.image_url || '/placeholder.png'}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">{item.product.name}</span>
                      <span className="text-black/80">{formatPrice(item.product.price_cents)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-black/60">Qtd: {item.quantity}</span>
                      <span className="text-[#e11d48] font-bold">{formatPrice(item.product.price_cents * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-4 flex justify-between text-[#e11d48] font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(state.total)}</span>
            </div>
          </GlassCard>

          {/* Formulário */}
          <GlassCard className="p-6 bg-white border border-neutral-200">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados de Entrega */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">Informações de Entrega</h3>
                <Input {...form.register('fullName')} placeholder="Nome completo" className="bg-white border border-neutral-200 text-black placeholder:text-neutral-400" />
                <Input {...form.register('phone')} placeholder="Telefone" className="bg-white border border-neutral-200 text-black placeholder:text-neutral-400" />
                <Input {...form.register('address')} placeholder="Endereço (opcional)" className="bg-white border border-neutral-200 text-black placeholder:text-neutral-400" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={requestLocation}
                  className={`w-full border-2 ${location ? 'border-[#e11d48] bg-[#e11d48]/10 text-[#e11d48]' : 'border-neutral-200 text-black hover:border-[#e11d48] hover:text-[#e11d48]'}`}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  {location ? 'Localização Capturada ✓' : 'Usar Minha Localização Atual'}
                </Button>
                {locationError && <p className="text-[#e11d48] text-sm">{locationError}</p>}
                {location && <p className="text-green-600 text-sm">Localização salva para entrega precisa!</p>}
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">Forma de Pagamento</h3>
                <div className="grid grid-cols-1 gap-3">
                  {['cash', 'card', 'pix'].map(method => {
                    const Icon = method === 'cash' ? Banknote : method === 'card' ? CreditCard : Smartphone
                    const label = method === 'cash' ? 'Dinheiro' : method === 'card' ? 'Cartão' : 'PIX'
                    return (
                      <label key={method} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${paymentMethod === method ? 'border-[#e11d48] bg-[#e11d48]/10' : 'border-neutral-200 bg-white'}`}>
                        <input type="radio" value={method} {...form.register('paymentMethod')} className="sr-only" />
                        <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-[#e11d48]' : 'text-black'}`} />
                        <div>
                          <div className={`font-medium ${paymentMethod === method ? 'text-[#e11d48]' : 'text-black'}`}>{label}</div>
                        </div>
                      </label>
                    )
                  })}
                  {paymentMethod === 'cash' && (
                    <Input {...form.register('changeFor')} type="number" step="0.01" placeholder="Troco para quanto? (opcional)" className="bg-white border border-neutral-200 text-black placeholder:text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">Observações</h3>
                <Textarea {...form.register('notes')} placeholder="Observações sobre o pedido (opcional)" className="bg-white border border-neutral-200 text-black placeholder:text-neutral-400 resize-none" rows={3} />
              </div>

              <Button
                type="submit"
                disabled={loading || !location}
                className={`w-full rounded-full py-4 text-lg font-semibold ${!location ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-[#e11d48] hover:bg-[#be123c] text-white'}`}
              >
                {loading ? 'Processando...' : `Confirmar Pedido - ${formatPrice(state.total)}`}
              </Button>
              {!location && (
                <p className="text-[#e11d48] text-center text-sm mt-2">É obrigatório capturar sua localização para finalizar o pedido.</p>
              )}
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
