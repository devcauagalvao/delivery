'use client'

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { Product } from '@/lib/supabase'

// Cart item snapshot (persisted in localStorage) — follow the spec exactly
export interface CartOption {
  option_id: string
  option_name: string
  unit_price_cents: number
  quantity: number
}

export interface CartItem {
  product_id: string
  product_name: string
  unit_price_cents: number
  quantity: number
  item_notes?: string | null
  selectedOptions?: CartOption[]
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; productId: string; selectedOptionsKey?: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number; selectedOptionsKey?: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

const LOCALSTORAGE_KEY = 'cart'

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity + (item.selectedOptions || []).reduce((s, o) => s + o.unit_price_cents * o.quantity, 0), 0)

// Helper to create a stable key for item+options comparison
const itemKey = (item: CartItem) => `${item.product_id}::${JSON.stringify(item.selectedOptions || [])}`

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Prevent duplicate items (merge by product_id + selectedOptions)
      const key = itemKey(action.item)
      const existingIndex = state.items.findIndex(i => itemKey(i) === key)

      if (existingIndex > -1) {
        const newItems = [...state.items]
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItems[existingIndex].quantity + action.item.quantity }
        return { items: newItems }
      }

      return { items: [...state.items, action.item] }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i.product_id !== action.productId || (action.selectedOptionsKey && itemKey(i) !== action.selectedOptionsKey))
      return { items: newItems }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(i =>
        i.product_id === action.productId && (!action.selectedOptionsKey || itemKey(i) === action.selectedOptionsKey)
          ? { ...i, quantity: action.quantity }
          : i
      ).filter(i => i.quantity > 0)
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
  addItem: (productOrSnapshot: Product | CartItem, opts?: { quantity?: number; selectedOptions?: CartOption[]; item_notes?: string }) => void
  removeItem: (productId: string, selectedOptionsKey?: string) => void
  updateQuantity: (productId: string, quantity: number, selectedOptionsKey?: string) => void
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
      const saved = localStorage.getItem(LOCALSTORAGE_KEY)
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
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state.items))
    } catch (e) {
      console.warn('Failed to persist cart', e)
    }
  }, [state.items])

  const addItem = useCallback((productOrSnapshot: Product | CartItem, opts: { quantity?: number; selectedOptions?: CartOption[]; item_notes?: string } = {}) => {
    // Accept legacy Product (from UI) or full CartItem snapshot
    let item: CartItem
    if ((productOrSnapshot as Product).id) {
      const p = productOrSnapshot as Product
      item = {
        product_id: p.id,
        product_name: p.name,
        unit_price_cents: p.price_cents,
        quantity: opts.quantity ?? 1,
        item_notes: opts.item_notes ?? null,
        selectedOptions: opts.selectedOptions ?? [],
      }
    } else {
      item = productOrSnapshot as CartItem
      item.quantity = opts.quantity ?? item.quantity ?? 1
      if (opts.selectedOptions) item.selectedOptions = opts.selectedOptions
    }

    dispatch({ type: 'ADD_ITEM', item })
  }, [])

  const removeItem = useCallback((productId: string, selectedOptionsKey?: string) => dispatch({ type: 'REMOVE_ITEM', productId, selectedOptionsKey }), [])
  const updateQuantity = useCallback((productId: string, quantity: number, selectedOptionsKey?: string) =>
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity, selectedOptionsKey }), [])
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
