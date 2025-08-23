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
import { v4 as uuidv4 } from 'uuid'

/* ------------------- Validação ------------------- */
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
      paymentMethod: 'cash'
    }
  })

  const paymentMethod = form.watch('paymentMethod')

  /* ------------------- Proteção de rota ------------------- */
  useEffect(() => {
    if (!user) return router.push('/auth')
    if (state.items.length === 0) return router.push('/')
  }, [user, state.items, router])

  /* ------------------- Captura localização ------------------- */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador')
      return
    }
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        toast.success('Localização capturada com sucesso!')
      },
      () => setLocationError('Erro ao obter localização. Verifique as permissões.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  /* ------------------- Helpers ------------------- */
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const totalCents = useMemo(
    () => state.items.reduce((acc, item) => acc + item.product.price_cents * item.quantity, 0),
    [state.items]
  )

  const canSubmit = !loading && (location || form.getValues('address'))

  /* ------------------- Submit ------------------- */
  const onSubmit = async (data: CheckoutData) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado.')
      return
    }
    if (state.items.length === 0) {
      toast.error('Carrinho vazio.')
      return
    }
    if (!location && !data.address) {
      setLocationError('É obrigatório capturar sua localização ou informar um endereço.')
      return
    }

    setLoading(true)
    try {
      const orderId = uuidv4()

      const orderItems = state.items.map(item => ({
        id: uuidv4(),
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_cents: item.product.price_cents,
        subtotal_cents: item.product.price_cents * item.quantity,
        order_id: orderId
      }))

      const orderPayload = {
        id: orderId,
        customer_id: user.id,
        status: 'pending',
        payment_method: data.paymentMethod,
        total_cents: totalCents,
        notes: data.notes || null,
        delivery_lat: location?.lat || null,
        delivery_lng: location?.lng || null,
        change_for_cents:
          data.paymentMethod === 'cash' && data.changeFor
            ? Math.round(parseFloat(data.changeFor) * 100)
            : null,
        customer_name: data.fullName,
        customer_phone: data.phone.replace(/\D/g, ''),
        delivery_address: data.address || null
      }

      const { error: orderError } = await supabase.from('orders').insert([orderPayload])
      if (orderError) throw orderError

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      toast.success('Pedido realizado com sucesso!')
      router.push(`/orders/success?orderId=${orderId}`)
    } catch (error: any) {
      console.error('Erro no checkout:', error)
      toast.error('Erro ao processar pedido: ' + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  /* ------------------- UI ------------------- */
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a]">
        <GlassCard className="p-8 text-center bg-[#1a1a1a]/80 border border-white/20">
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="default" size="sm" className="text-white hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Finalizar Pedido</h1>
            <p className="text-white/70">Revise os produtos e complete os dados para entrega</p>
          </div>
        </div>

        {/* Resumo do pedido */}
        <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white space-y-3">
          <h2 className="text-xl font-semibold">Resumo do Pedido</h2>
          {state.items.map(item => (
            <div key={item.product.id} className="flex justify-between items-center border-b border-white/20 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#111] border border-white/20 flex-shrink-0">
                  <Image
                    src={item.product.image_url || '/placeholder.png'}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span className="text-sm text-white/70">{formatPrice(item.product.price_cents)} cada</span>
                </div>
              </div>
              <span className="font-semibold text-[#cc9b3b]">{formatPrice(item.product.price_cents * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Total</span>
            <span className="text-[#cc9b3b]">{formatPrice(totalCents)}</span>
          </div>
        </GlassCard>

        {/* Formulário */}
        <GlassCard className="p-6 bg-[#1a1a1a]/50 border border-white/20 text-white">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados de entrega */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações de Entrega</h3>
              <Input {...form.register('fullName')} placeholder="Nome completo" className="bg-[#111] border border-white/20 text-white placeholder:text-white/50 rounded-2xl" disabled={loading} />
              {form.formState.errors.fullName && <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>}
              <Input {...form.register('phone')} placeholder="Telefone" className="bg-[#111] border border-white/20 text-white placeholder:text-white/50 rounded-2xl" disabled={loading} />
              {form.formState.errors.phone && <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>}
              <Input {...form.register('address')} placeholder="Endereço (opcional)" className="bg-[#111] border border-white/20 text-white placeholder:text-white/50 rounded-2xl" disabled={loading} />
              <Button
                type="button"
                onClick={requestLocation}
                disabled={loading}
                className={`w-full border-2 flex items-center justify-center gap-2 ${location ? 'border-[#cc9b3b] bg-[#cc9b3b]/10 text-[#cc9b3b]' : 'border-white/20 text-white hover:border-[#cc9b3b] hover:text-[#cc9b3b] rounded-2xl'}`}
              >
                <MapPin className="w-5 h-5" />
                {location ? 'Localização Capturada ✓' : 'Usar Minha Localização Atual'}
              </Button>
              {locationError && <p className="text-[#cc9b3b] text-sm">{locationError}</p>}
            </div>

            {/* Pagamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Forma de Pagamento</h3>
              <div className="grid grid-cols-1 gap-3">
                {['cash', 'card', 'pix'].map(method => {
                  const Icon = method === 'cash' ? Banknote : method === 'card' ? CreditCard : Smartphone
                  const label = method === 'cash' ? 'Dinheiro' : method === 'card' ? 'Cartão' : 'PIX'
                  return (
                    <label key={method} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${paymentMethod === method ? 'border-[#cc9b3b] bg-[#cc9b3b]/10' : 'border-white/20 bg-[#111]'}`}>
                      <input type="radio" value={method} {...form.register('paymentMethod')} className="sr-only" disabled={loading} />
                      <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-[#cc9b3b]' : 'text-white'}`} />
                      <div className={`font-medium ${paymentMethod === method ? 'text-[#cc9b3b]' : 'text-white'}`}>{label}</div>
                    </label>
                  )
                })}
                {paymentMethod === 'cash' && (
                  <Input {...form.register('changeFor')} placeholder="Troco para (opcional)" className="bg-[#111] border border-white/20 text-white placeholder:text-white/50 rounded-2xl" disabled={loading} />
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observações</h3>
              <Textarea {...form.register('notes')} placeholder="Observações sobre o pedido (opcional)" className="bg-[#111] border border-white/20 text-white rounded-2xl placeholder:text-white/50 resize-none" rows={3} disabled={loading} />
            </div>

            <div className="text-center">
              <Button type="submit" disabled={!canSubmit} className={`w-full bg-[#cc9b3b] text-white hover:bg-[#b28732] rounded-2xl py-4 text-lg font-semibold ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? 'Processando...' : `Finalizar Pedido - ${formatPrice(totalCents)}`}
              </Button>
              {!canSubmit && <p className="text-[#cc9b3b] text-sm mt-2">É obrigatório capturar sua localização ou informar endereço.</p>}
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
