'use client'

import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Informe o nome'),
  phone: z.string().optional().nullable(),
  role: z.enum(['customer', 'admin']).optional(),
  // optional fields for creating a new auth user (admin only flow)
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
})

type FormValues = z.infer<typeof schema>

export default function ClientForm({ initial, onSubmit, submitLabel = 'Salvar' }: { initial?: Partial<FormValues>; onSubmit: (v: FormValues) => Promise<void>; submitLabel?: string }) {
  const { toast } = useToast()

  const { register, handleSubmit, formState, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { role: 'customer' },
  })

  const { errors, isSubmitting } = formState

  // simple phone mask (keeps dependencies small)
  const phone = watch('phone')
  React.useEffect(() => {
    if (!phone) return
    const digits = phone.replace(/\D/g, '')
    let formatted = digits
    if (digits.length > 2) formatted = `(${digits.slice(0,2)}) ${digits.slice(2)}`
    if (digits.length > 7) formatted = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
    if (formatted !== phone) setValue('phone', formatted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone])

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSubmit({ ...values, phone: values.phone ?? null })
          toast({ title: 'Sucesso', description: 'Operação concluída', action: null })
        } catch (err: any) {
          toast({ title: 'Erro', description: err?.message || 'Falha ao salvar cliente' })
          throw err
        }
      })}
      className="space-y-3"
    >
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Nome</label>
        <input {...register('full_name')} className="input w-full" />
        {errors.full_name && <p className="text-sm text-red-400 mt-1">{errors.full_name.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Telefone</label>
        <input {...register('phone')} className="input w-full" placeholder="(99) 99999-9999" />
        {errors.phone && <p className="text-sm text-red-400 mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Role</label>
        <select {...register('role')} className="input w-full">
          <option value="customer">customer</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Email (criar auth.user)</label>
        <input {...register('email')} className="input w-full" placeholder="opcional — cria auth.user" />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Senha (criar auth.user)</label>
        <input {...register('password')} type="password" className="input w-full" placeholder="mín. 6 caracteres" />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : submitLabel}</button>
      </div>
    </form>
  )
}
