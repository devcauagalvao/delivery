import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/hooks/use-cart'
import { Product } from '@/lib/supabase'

const mockProduct: Product = {
  id: '1',
  name: 'Test Burger',
  description: 'A test burger',
  price_cents: 2500,
  original_price_cents: 3000,
  image_url: null,
  active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
}

describe('Cart Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  )

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct)
    })

    expect(result.current.state.items).toHaveLength(1)
    expect(result.current.state.items[0].product.id).toBe('1')
    expect(result.current.state.items[0].quantity).toBe(1)
    expect(result.current.itemCount).toBe(1)
  })

  it('should increase quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct)
      result.current.addItem(mockProduct)
    })

    expect(result.current.state.items).toHaveLength(1)
    expect(result.current.state.items[0].quantity).toBe(2)
    expect(result.current.itemCount).toBe(2)
  })

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct)
    })

    expect(result.current.state.total).toBe(2500)

    act(() => {
      result.current.addItem(mockProduct)
    })

    expect(result.current.state.total).toBe(5000)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(mockProduct)
    })

    expect(result.current.state.items).toHaveLength(1)

    act(() => {
      result.current.removeItem('1')
    })

    expect(result.current.state.items).toHaveLength(0)
    expect(result.current.state.total).toBe(0)
  })
})