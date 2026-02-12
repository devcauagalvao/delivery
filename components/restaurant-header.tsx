'use client'

import { motion } from 'framer-motion'
import { Clock, Truck, AlertCircle, MapPin, DollarSign } from 'lucide-react'
import { GlassCard } from './ui/glass-card'
import { colors } from '@/lib/design-tokens'

export interface RestaurantInfo {
  name: string
  logo?: string
  status: 'open' | 'closed' | 'coming'
  openingHour?: string
  closingHour?: string
  averagePrepTime?: number // em minutos
  deliveryFee?: number // em centavos
  minimumOrder?: number // em centavos
  closedMessage?: string
  comingTime?: string
}

export function RestaurantHeader({ info }: { info: RestaurantInfo }) {
  const isOpen = info.status === 'open'
  const statusColor = isOpen ? colors.status.success : colors.status.error
  const statusLabel = isOpen ? 'Aberto agora' : info.status === 'coming' ? `Abre ${info.comingTime}` : 'Fechado'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Banner principal */}
      <GlassCard variant="elevated" className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          {/* Logo e nome */}
          <div className="flex-1 flex items-center gap-4">
            {info.logo && (
              <img
                src={info.logo}
                alt={info.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{info.name}</h1>
              <motion.div
                className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${statusColor}1a`,
                  color: statusColor,
                }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ backgroundColor: statusColor }}
                />
                {statusLabel}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Informações principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Horário */}
          {info.openingHour && info.closingHour && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Clock className="w-5 h-5 text-[#cc9b3b] flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Horário</div>
                <div className="font-semibold">{info.openingHour} - {info.closingHour}</div>
              </div>
            </div>
          )}

          {/* Tempo de preparo */}
          {info.averagePrepTime && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Clock className="w-5 h-5 text-[#cc9b3b] flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Preparo</div>
                <div className="font-semibold">~{info.averagePrepTime}min</div>
              </div>
            </div>
          )}

          {/* Taxa de entrega */}
          {info.deliveryFee !== undefined && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Truck className="w-5 h-5 text-[#cc9b3b] flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Entrega</div>
                <div className="font-semibold">
                  {info.deliveryFee === 0 ? 'Grátis' : `R$ ${(info.deliveryFee / 100).toFixed(2)}`}
                </div>
              </div>
            </div>
          )}

          {/* Pedido mínimo */}
          {info.minimumOrder && (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <DollarSign className="w-5 h-5 text-[#cc9b3b] flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400">Mínimo</div>
                <div className="font-semibold">R$ {(info.minimumOrder / 100).toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Banner de aviso se fechado */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl border-l-4"
          style={{
            backgroundColor: `${colors.status.error}1a`,
            borderColor: colors.status.error,
          }}
        >
          <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-200">
            {info.closedMessage || 'O restaurante está fechado no momento.'}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * Menu de categorias com indicador de seleção
 */
export function CategoryMenu({
  categories,
  activeCategory,
  onChange,
}: {
  categories: string[]
  activeCategory: string
  onChange: (category: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-20 z-30 bg-[#0a0a0a]/80 backdrop-blur-lg py-3 px-4 border-b border-white/10"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onChange(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
              activeCategory === category
                ? 'bg-[#cc9b3b] text-black'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
