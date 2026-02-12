'use client'

import { motion } from 'framer-motion'
import { Check, Clock, Truck, MapPin } from 'lucide-react'
import { colors } from '@/lib/design-tokens'

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

interface StatusInfo {
  label: string
  color: string
  bgColor: string
  icon: React.ReactNode
  description: string
}

const statusMap: Record<OrderStatus, StatusInfo> = {
  pending: {
    label: 'Aguardando Confirmação',
    color: colors.status.pending,
    bgColor: `${colors.status.pending}1a`,
    icon: <Clock className="w-5 h-5" />,
    description: 'Seu pedido foi recebido',
  },
  accepted: {
    label: 'Confirmado',
    color: colors.status.success,
    bgColor: `${colors.status.success}1a`,
    icon: <Check className="w-5 h-5" />,
    description: 'O restaurante confirmou seu pedido',
  },
  preparing: {
    label: 'Em Preparo',
    color: colors.status.processing,
    bgColor: `${colors.status.processing}1a`,
    icon: <Clock className="w-5 h-5" />,
    description: 'Sua comida está sendo preparada',
  },
  out_for_delivery: {
    label: 'Saiu para Entrega',
    color: colors.status.delivery,
    bgColor: `${colors.status.delivery}1a`,
    icon: <Truck className="w-5 h-5" />,
    description: 'Seu pedido está a caminho',
  },
  delivered: {
    label: 'Entregue',
    color: colors.status.success,
    bgColor: `${colors.status.success}1a`,
    icon: <Check className="w-5 h-5" />,
    description: 'Pedido entregue com sucesso',
  },
  cancelled: {
    label: 'Cancelado',
    color: colors.status.error,
    bgColor: `${colors.status.error}1a`,
    icon: <Clock className="w-5 h-5" />,
    description: 'Seu pedido foi cancelado',
  },
}

/**
 * Badge de status do pedido
 */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const info = statusMap[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        backgroundColor: info.bgColor,
        color: info.color,
      }}
    >
      {info.icon}
      <span className="font-semibold text-sm">{info.label}</span>
    </motion.div>
  )
}

/**
 * Timeline visual de status do pedido
 */
interface TimelineStep {
  status: OrderStatus
  completed: boolean
  date?: string
}

export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const info = statusMap[step.status]
        const isLast = index === steps.length - 1

        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            {/* Ponto */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={
                  step.completed
                    ? { scale: [1, 1.2, 1] }
                    : { opacity: 0.5 }
                }
                transition={{ duration: 0.6, repeat: step.completed ? 0 : Infinity }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: step.completed ? info.bgColor : `${info.color}1a`,
                  color: info.color,
                }}
              >
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  info.icon
                )}
              </motion.div>

              {!isLast && (
                <div
                  className="w-1 h-12 mt-2"
                  style={{
                    backgroundColor: step.completed ? info.color : `${info.color}33`,
                  }}
                />
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 py-2">
              <div className="font-semibold text-white">{info.label}</div>
              <div className="text-sm text-gray-400">{info.description}</div>
              {step.date && (
                <div className="text-xs text-gray-500 mt-1">{step.date}</div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Card de resumo de status
 */
export function StatusSummary({
  status,
  estimatedTime,
  orderNumber,
}: {
  status: OrderStatus
  estimatedTime?: string
  orderNumber: string
}) {
  const info = statusMap[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-6 space-y-4"
      style={{
        backgroundColor: info.bgColor,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: info.color,
              color: colors.background.dark,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {info.icon}
          </motion.div>
          <div>
            <div className="font-bold text-lg text-white">{info.label}</div>
            <div className="text-sm text-gray-300">Pedido #{orderNumber}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="text-sm text-gray-400">{info.description}</div>
        {estimatedTime && (
          <div className="text-lg font-semibold text-white mt-2">
            ⏱️ {estimatedTime}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Indicador simples de status com animação
 */
export function StatusIndicator({
  status,
  size = 'md',
}: {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
}) {
  const info = statusMap[status]
  const sizeMap = { sm: 6, md: 8, lg: 12 }

  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="rounded-full"
      style={{
        width: `${sizeMap[size]}px`,
        height: `${sizeMap[size]}px`,
        backgroundColor: info.color,
      }}
    />
  )
}
