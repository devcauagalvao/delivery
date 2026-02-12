import { useCallback, useEffect, useRef, useState } from 'react'
import type { Client } from '@/lib/clients'
import * as clientsLib from '@/lib/clients'

// small local debounce to avoid extra typings/deps
function localDebounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

export function useClients({ initial = undefined, pageSize = 20 } = {}) {
  const [data, setData] = useState<Client[] | undefined>(initial)
  const [loading, setLoading] = useState<boolean>(!initial)
  const [error, setError] = useState<Error | null>(null)
  const [search, setSearch] = useState<string | undefined>(undefined)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const fetchNow = useCallback(async ({ pg = 1, q }: { pg?: number; q?: string } = {}) => {
    setError(null)
    setLoading(true)
    try {
      const res = await clientsLib.getClients({ search: q, page: pg, pageSize })
      setData(res.data)
      setTotal(res.total)
      setPage(res.page)
      setLoading(false)
    } catch (err: any) {
      setError(err)
      setLoading(false)
    }
  }, [pageSize])

  // debounced search to avoid spamming Supabase
  // 300ms as requested
  const debounced = useRef(
    localDebounce((q: string | undefined) => {
      fetchNow({ pg: 1, q })
    }, 300)
  )

  useEffect(() => {
    fetchNow({ pg: page, q: search })
    // no special cleanup required
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    debounced.current(search)
  }, [search])

  const refresh = useCallback(() => fetchNow({ pg: page, q: search }), [fetchNow, page, search])

  const goToPage = useCallback((p: number) => {
    setPage(p)
    fetchNow({ pg: p, q: search })
  }, [fetchNow, search])

  // Mutations (simple wrappers that call lib functions and then refresh)
  const createClient = useCallback(async (payload: any) => {
    // if caller provided email+password, call server-safe API route which uses service role
    if (payload?.email && payload?.password) {
      const resp = await fetch('/api/admin/create-user', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json?.error || 'Falha ao criar cliente (server)')
      await fetchNow({ pg: 1, q: search })
      return json.data
    }

    const res = await clientsLib.createClient(payload)
    await fetchNow({ pg: 1, q: search })
    return res
  }, [fetchNow, search])

  const updateClient = useCallback(async (id: string, payload: any) => {
    const res = await clientsLib.updateClient(id, payload)
    await fetchNow({ pg: page, q: search })
    return res
  }, [fetchNow, page, search])

  const deleteClient = useCallback(async (id: string) => {
    const res = await clientsLib.deleteClient(id)
    await fetchNow({ pg: page, q: search })
    return res
  }, [fetchNow, page, search])

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    total,
    search,
    setSearch,
    goToPage,
    refresh,
    createClient,
    updateClient,
    deleteClient,
  }
}
