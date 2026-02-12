import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as clientsLib from '@/lib/clients'
import { useClients } from '@/hooks/use-clients'

vi.mock('@/lib/clients')

describe('useClients hook', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches initial page and handles search debounce', async () => {
    const fake = [{ id: '1', full_name: 'Alice', phone: '11', role: 'customer', created_at: new Date().toISOString() }]
    ;(clientsLib.getClients as any).mockResolvedValue({ data: fake, total: 1, page: 1 })

    const { result, waitForNextUpdate } = renderHook(() => useClients({ pageSize: 10 }))

    // initial fetch
    await waitForNextUpdate()
    expect(result.current.data).toEqual(fake)

    // trigger search (debounced)
    ;(clientsLib.getClients as any).mockResolvedValue({ data: [], total: 0, page: 1 })
    act(() => {
      result.current.setSearch('bob')
    })

    // wait more than debounce time
    await new Promise((r) => setTimeout(r, 350))
    expect(clientsLib.getClients).toHaveBeenCalled()
  })
})