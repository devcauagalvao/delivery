'use client'

import { useState, useEffect, useMemo } from 'react'
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
      paymentMethod: 'cash',
    },
  })

  const paymentMethod = form.watch('paymentMethod')

  // Proteção de rota
  useEffect(() => {
    if (!user || state.items.length === 0) router.push('/')
  }, [user, state.items, router])

  // Captura localização
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

  // Helpers
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const totalCents = useMemo(
    () => state.items.reduce((acc, item) => acc + item.product.price_cents * item.quantity, 0),
    [state.items]
  )

  // Submit
  const onSubmit = async (data: CheckoutData) => {
    if (!user?.id) return toast.error('Usuário não autenticado.')
    if (state.items.length === 0) return toast.error('Carrinho vazio.')
    if (!location && !data.address) return setLocationError('Informe endereço ou capture a localização.')

    setLoading(true)
    try {
      const orderItems = state.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_cents: item.product.price_cents,
        subtotal_cents: item.product.price_cents * item.quantity,
      }))

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

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single()

      if (!orderData?.id || orderError) throw orderError || new Error('ID do pedido não retornado')

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems.map((item) => ({ ...item, order_id: orderData.id })))
      if (itemsError) throw itemsError

      clearCart()
      toast.success('Pedido realizado!')
      router.push(`/orders/success?orderId=${orderData.id}`)
    } catch (err: any) {
      console.error(err)
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
            <h2 className="text-xl font-semibold mb-4">Produtos do Pedido</h2>
            <div className="space-y-4 mb-4">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 border-b border-white/20 pb-3">
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 bg-[#111]">
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
                      <span className="font-semibold">{item.product.name}</span>
                      <span className="text-[#cc9b3b]">{formatPrice(item.product.price_cents)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-white/70">Qtd: {item.quantity}</span>
                      <span className="font-bold text-[#cc9b3b]">
                        {formatPrice(item.product.price_cents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-[#cc9b3b] text-lg">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </GlassCard>

          {/* Formulário */}
          <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados de entrega */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações de Entrega</h3>
                <Input {...form.register('fullName')} placeholder="Nome completo" className="bg-[#111] border border-white/20 text-white rounded-2xl" />
                <Input {...form.register('phone')} placeholder="Telefone" className="bg-[#111] border border-white/20 text-white rounded-2xl" />
                <Input {...form.register('address')} placeholder="Endereço (opcional)" className="bg-[#111] border border-white/20 text-white rounded-2xl" />
                <Button type="button" onClick={requestLocation} className={`w-full flex items-center justify-center gap-2 ${location ? 'border-[#cc9b3b] bg-[#cc9b3b]/10 text-[#cc9b3b]' : 'border-white/20 text-white hover:border-[#cc9b3b] hover:text-[#cc9b3b] rounded-2xl'}`}>
                  <MapPin className="w-5 h-5" />
                  {location ? 'Localização Capturada ✓' : 'Usar Minha Localização Atual'}
                </Button>
                {locationError && <p className="text-[#cc9b3b] text-sm">{locationError}</p>}
              </div>

              {/* Pagamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Forma de Pagamento</h3>
                <div className="grid grid-cols-1 gap-3">
                  {['cash', 'card', 'pix'].map((method) => {
                    const Icon = method === 'cash' ? Banknote : method === 'card' ? CreditCard : Smartphone
                    const label = method === 'cash' ? 'Dinheiro' : method === 'card' ? 'Cartão' : 'PIX'
                    return (
                      <label key={method} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${paymentMethod === method ? 'border-[#cc9b3b] bg-[#cc9b3b]/10' : 'border-white/20 bg-[#111]'}`}>
                        <input type="radio" value={method} {...form.register('paymentMethod')} className="sr-only" />
                        <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-[#cc9b3b]' : 'text-white'}`} />
                        <div className={`${paymentMethod === method ? 'text-[#cc9b3b]' : 'text-white'} font-medium`}>{label}</div>
                      </label>
                    )
                  })}
                  {paymentMethod === 'cash' && (
                    <Input {...form.register('changeFor')} type="number" step="0.01" placeholder="Troco para quanto? (opcional)" className="bg-[#111] border border-white/20 text-white rounded-2xl placeholder:text-white/50" />
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Observações</h3>
                <Textarea {...form.register('notes')} placeholder="Observações sobre o pedido (opcional)" className="bg-[#111] border border-white/20 text-white rounded-2xl placeholder:text-white/50 resize-none" rows={3} />
              </div>

              <Button
                type="submit"
                disabled={loading || (!location && !form.getValues('address'))}
                className={`w-full rounded-full py-4 text-lg font-semibold ${!location && !form.getValues('address') ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-[#cc9b3b] hover:bg-[#b88b30] text-white'}`}
              >
                {loading ? 'Processando...' : `Confirmar Pedido - ${formatPrice(totalCents)}`}
              </Button>
              {!location && !form.getValues('address') && (
                <p className="text-[#cc9b3b] text-center text-sm mt-2">É obrigatório capturar sua localização ou informar endereço para finalizar o pedido.</p>
              )}
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
