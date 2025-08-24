import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pin, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const checkoutSchema = z.object({
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    address: z.string().optional(),
    paymentMethod: z.enum(['cash', 'card', 'pix']),
    changeFor: z.string().optional(),
    notes: z.string().optional(),
})
export type CheckoutData = z.infer<typeof checkoutSchema>

type Props = {
    defaultValues: Partial<CheckoutData>
    onSubmit: (data: CheckoutData) => void
    loading: boolean
    location: { lat: number; lng: number } | null
    locationError: string
    requestLocation: () => void
}

export default function CheckoutForm({
    defaultValues,
    onSubmit,
    loading,
    location,
    locationError,
    requestLocation,
}: Props) {
    const form = useForm<CheckoutData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues,
    })

    const paymentMethod = form.watch('paymentMethod')
    const addressValue = form.watch('address')

    const [isAddressAutoFilled, setIsAddressAutoFilled] = useState(false)

    useEffect(() => {
        async function fetchAddress() {
            if (!location) return

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`
                )
                const data = await res.json()

                if (data && data.display_name) {
                    // Atualiza o campo endereço apenas se não tiver sido editado manualmente
                    if (!addressValue || isAddressAutoFilled) {
                        form.setValue('address', data.display_name)
                        setIsAddressAutoFilled(true)
                    }
                }
            } catch {
                // falha silenciosa
            }
        }

        fetchAddress()
    }, [location])

    // Detecta se o usuário digitou manualmente no campo endereço
    useEffect(() => {
        if (addressValue && !isAddressAutoFilled) return // já foi alterado manualmente
        if (!addressValue && isAddressAutoFilled) setIsAddressAutoFilled(false)
    }, [addressValue])

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados de entrega */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações de Entrega</h3>
                <Input
                    {...form.register('fullName')}
                    placeholder="Nome completo"
                    className="bg-[#111] border border-white/20 text-white rounded-2xl"
                />
                <Input
                    {...form.register('phone')}
                    placeholder="Telefone"
                    className="bg-[#111] border border-white/20 text-white rounded-2xl"
                />
                <Input
                    {...form.register('address')}
                    placeholder="Endereço (opcional)"
                    className="bg-[#111] border border-white/20 text-white rounded-2xl"
                />
                <Button
                    type="button"
                    onClick={requestLocation}
                    className={`w-full flex items-center justify-center gap-2 ${location
                            ? 'border-[#cc9b3b] bg-[#cc9b3b]/10 text-[#cc9b3b]'
                            : 'border-white/20 text-white hover:border-[#cc9b3b] hover:text-[#cc9b3b] rounded-2xl'
                        }`}
                >
                    <Pin className="w-5 h-5" />
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
                            <label
                                key={method}
                                className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${paymentMethod === method ? 'border-[#cc9b3b] bg-[#cc9b3b]/10' : 'border-white/20 bg-[#111]'
                                    }`}
                            >
                                <input type="radio" value={method} {...form.register('paymentMethod')} className="sr-only" />
                                <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-[#cc9b3b]' : 'text-white'}`} />
                                <div className={`${paymentMethod === method ? 'text-[#cc9b3b]' : 'text-white'} font-medium`}>
                                    {label}
                                </div>
                            </label>
                        )
                    })}
                    {paymentMethod === 'cash' && (
                        <Input
                            {...form.register('changeFor')}
                            type="number"
                            step="0.01"
                            placeholder="Troco para quanto? (opcional)"
                            className="bg-[#111] border border-white/20 text-white rounded-2xl placeholder:text-white/50"
                        />
                    )}
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Observações</h3>
                <Textarea
                    {...form.register('notes')}
                    placeholder="Observações sobre o pedido (opcional)"
                    className="bg-[#111] border border-white/20 text-white rounded-2xl placeholder:text-white/50 resize-none"
                    rows={3}
                />
            </div>

            <Button
                type="submit"
                disabled={loading || (!location && !form.getValues('address'))}
                className={`w-full rounded-full py-4 text-lg font-semibold ${!location && !form.getValues('address')
                        ? 'bg-white/20 text-white/50 cursor-not-allowed'
                        : 'bg-[#cc9b3b] hover:bg-[#b88b30] text-white'
                    }`}
            >
                {loading ? 'Processando...' : 'Confirmar Pedido'}
            </Button>
            {!location && !form.getValues('address') && (
                <p className="text-[#cc9b3b] text-center text-sm mt-2">
                    É obrigatório capturar sua localização ou informar endereço para finalizar o pedido.
                </p>
            )}
        </form>
    )
}
