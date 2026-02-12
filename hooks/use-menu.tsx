import { useEffect, useRef, useState, useCallback } from 'react'
import { getMenu } from '@/lib/menu'
import type { MenuCategory } from '@/lib/menu'

export function useMenu({ initial = undefined, timeoutMs = 15000 } = {}) {
  const [data, setData] = useState<MenuCategory[] | undefined>(initial)
  const [loading, setLoading] = useState<boolean>(!initial)
  const [error, setError] = useState<Error | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const fetchNow = useCallback(async (opts: { force?: boolean } = {}) => {
    setError(null)
    if (!opts.force) {
      // if we already have data, don't set loading to true (SWR)
      setLoading(prev => (prev && !data ? true : false))
    } else {
      setLoading(true)
    }

    if (controllerRef.current) controllerRef.current.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      console.log('useMenu: fetching menu, force=', !!opts.force)
      const menu = await getMenu({ signal: controller.signal, timeoutMs, force: !!opts.force })
      setData(menu)
      setLoading(false)
      setError(null)
    } catch (err: any) {
      if (err?.message === 'aborted') return
      console.error('useMenu fetch error', err)
      setError(err)
      setLoading(false)
    }
  }, [timeoutMs, data])

  useEffect(() => {
    // initial fetch (SWR): getMenu returns cached immediately if available
    fetchNow()

    return () => {
      if (controllerRef.current) controllerRef.current.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const retry = useCallback(() => fetchNow({ force: true }), [fetchNow])

  return { data, loading, error, retry }
}
