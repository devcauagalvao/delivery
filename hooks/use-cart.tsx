'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { Product } from '@/lib/supabase'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.product.id)
      
      if (existingItem) {
        const newItems = state.items.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        return {
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (item.product.price_cents * item.quantity), 0)
        }
      }
      
      const newItems = [...state.items, { product: action.product, quantity: 1 }]
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.product.price_cents * item.quantity), 0)
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.productId)
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.product.price_cents * item.quantity), 0)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        const newItems = state.items.filter(item => item.product.id !== action.productId)
        return {
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (item.product.price_cents * item.quantity), 0)
        }
      }
      
      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      )
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.product.price_cents * item.quantity), 0)
      }
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 }
    
    case 'LOAD_CART':
      return {
        items: action.items,
        total: action.items.reduce((sum, item) => sum + (item.product.price_cents * item.quantity), 0)
      }
    
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        const items = JSON.parse(saved)
        dispatch({ type: 'LOAD_CART', items })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', product })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}