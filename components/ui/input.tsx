import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    helperText?: string
    icon?: React.ReactNode
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className={cn(
          'flex items-center h-12 w-full rounded-xl border transition-all duration-200 px-4',
          'bg-[#1a1a1a] text-white placeholder:text-gray-500',
          'border-white/20 hover:border-white/30 focus-within:border-[#cc9b3b] focus-within:ring-1 focus-within:ring-[#cc9b3b]',
          error && 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}>
          {icon && <div className="mr-2 text-gray-400 flex-shrink-0">{icon}</div>}
          <input
            type={type}
            className={cn(
              'flex-1 bg-transparent outline-none text-white file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && (
          <p className={cn(
            'text-xs mt-2',
            error ? 'text-red-400' : 'text-gray-400'
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
