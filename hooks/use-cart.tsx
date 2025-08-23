'use client'

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { Product } from '@/lib/supabase'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.product.id)
      let newItems: CartItem[]

      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { product: action.product, quantity: 1 }]
      }

      return { items: newItems }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.productId)
      return { items: newItems }
    }

    case 'UPDATE_QUANTITY': {
      let newItems: CartItem[]
      if (action.quantity <= 0) {
        newItems = state.items.filter(item => item.product.id !== action.productId)
      } else {
        newItems = state.items.map(item =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        )
      }
      return { items: newItems }
    }

    case 'CLEAR_CART':
      return { items: [] }

    case 'LOAD_CART':
      return { items: action.items }

    default:
      return state
  }
}

interface CartContextProps {
  state: CartState
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  totalCents: number
}

const CartContext = createContext<CartContextProps | null>(null)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        const items: CartItem[] = JSON.parse(saved)
        dispatch({ type: 'LOAD_CART', items })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = useCallback((product: Product) => dispatch({ type: 'ADD_ITEM', product }), [])
  const removeItem = useCallback((productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }), [])
  const updateQuantity = useCallback((productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])

  const itemCount = useMemo(() => state.items.reduce((sum, item) => sum + item.quantity, 0), [state.items])
  const totalCents = useMemo(() => calculateTotal(state.items), [state.items])

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, itemCount, totalCents }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
