import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        // Botão primário - ação principal
        primary: 'bg-[#cc9b3b] text-black hover:bg-[#e0b85c] active:bg-[#b28732]',
        // Botão secundário - ação secundária
        secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30',
        // Botão destrutivo - deletar/cancelar
        destructive: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50',
        // Botão fantasma - apenas ícone/link
        ghost: 'text-white hover:bg-white/10 border border-transparent hover:border-white/20',
        // Botão de link
        link: 'text-[#cc9b3b] underline underline-offset-2 hover:text-[#e0b85c]',
        // Default para compatibilidade
        default: 'bg-transparent text-inherit p-0 m-0 border-0 shadow-none outline-none',
        login: 'group relative w-11 h-11 rounded-full bg-primary text-primary-foreground transition-all duration-300 overflow-hidden flex items-center justify-start hover:w-[6rem]',
        logout: 'group relative w-11 h-11 rounded-full bg-red-500 text-white transition-all duration-300 overflow-hidden flex items-center justify-start hover:w-[6rem]',
        admin: 'group relative w-11 h-11 rounded-full border border-input bg-transparent text-foreground transition-all duration-300 overflow-hidden flex items-center justify-start hover:w-[6rem]',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-lg text-sm',
        sm: 'h-8 px-3 py-1 rounded-md text-xs',
        md: 'h-10 px-4 py-2 rounded-lg text-sm',
        lg: 'h-12 px-6 py-3 rounded-xl text-base',
        xl: 'h-14 px-8 py-4 rounded-2xl text-lg',
        icon: 'h-10 w-10 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
