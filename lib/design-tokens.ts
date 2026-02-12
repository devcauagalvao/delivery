/**
 * Design Tokens - Cores, espaçamento e tipografia
 * Mantém consistência visual em todo o app
 */

export const colors = {
  // Cores primárias
  primary: {
    main: '#cc9b3b',      // Ouro (ação principal)
    light: '#e0b85c',
    dark: '#b28732',
    bg: '#cc9b3b1a',      // Fundo com transparência
  },

  // Cores de status
  status: {
    success: '#10b981',   // Verde - Entregue
    processing: '#f59e0b', // Âmbar - Em preparo
    pending: '#6366f1',   // Índigo - Pendente
    delivery: '#3b82f6',  // Azul - Saiu para entrega
    error: '#ef4444',     // Vermelho - Erro
  },

  // Cores de fundo
  background: {
    dark: '#0a0a0a',
    darker: '#111111',
    card: '#1a1a1a',
    overlay: '#000000',
  },

  // Cores de texto
  text: {
    primary: '#ffffff',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    muted: '#6b7280',
  },

  // Cores de border
  border: {
    light: '#ffffff1a',
    medium: '#333333',
    strong: '#404040',
  },
}

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
}

export const typography = {
  h1: {
    size: '2rem',      // 32px
    weight: '700',
    lineHeight: '1.2',
  },
  h2: {
    size: '1.5rem',    // 24px
    weight: '600',
    lineHeight: '1.3',
  },
  h3: {
    size: '1.25rem',   // 20px
    weight: '600',
    lineHeight: '1.4',
  },
  body: {
    size: '1rem',      // 16px
    weight: '400',
    lineHeight: '1.5',
  },
  small: {
    size: '0.875rem',  // 14px
    weight: '400',
    lineHeight: '1.5',
  },
  tiny: {
    size: '0.75rem',   // 12px
    weight: '500',
    lineHeight: '1.4',
  },
}

export const borderRadius = {
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}

export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
}
