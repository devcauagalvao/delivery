import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'minimal' | 'elevated'
}

/**
 * GlassCard - Componente base com efeito glassmorphism
 * Variantes:
 * - default: Padrão com backdrop blur e border
 * - minimal: Apenas bg/border sem blur
 * - elevated: Com sombra mais pronunciada
 */
export function GlassCard({ 
  children, 
  className, 
  hover = false, 
  onClick,
  variant = 'default'
}: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div
  
  const variantClasses = {
    default: 'bg-[#1a1a1a]/50 backdrop-blur-xl border border-white/10 hover:border-white/20',
    minimal: 'bg-[#111111]/40 border border-white/5 hover:border-white/10',
    elevated: 'bg-[#1a1a1a]/60 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/30 hover:shadow-2xl hover:shadow-black/50 hover:border-white/30',
  }
  
  return (
    <Component
      className={cn(
        'rounded-2xl transition-all duration-300',
        variantClasses[variant],
        hover && 'cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  )
}

/**
 * Card simples sem effects
 */
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-[#1a1a1a] border border-white/10 p-4', className)}>
      {children}
    </div>
  )
}