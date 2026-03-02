import { supabase } from './supabase'

export type MenuOption = {
  id: string
  name: string
  unit_price_cents: number
  active?: boolean
}

export type MenuOptionGroup = {
  id: string
  name: string
  min_select?: number | null
  max_select?: number | null
  required?: boolean | null
  options: MenuOption[]
}

export type MenuProduct = {
  id: string
  name: string
  description?: string | null
  created_at?: string | null
  price_cents: number
  original_price_cents?: number | null
  image_url?: string | null
  active: boolean
  sort_order?: number | null
  option_groups?: MenuOptionGroup[]
}

export type MenuCategory = {
  id: string
  name: string
  sort_order?: number | null
  products: MenuProduct[]
}

/**
 * getMenu
 * Retorna categorias ativas ordenadas junto com produtos ativos por categoria
 * e os grupos de opções vinculados a cada produto (com suas opções ativas).
 *
 * Implementação em etapas simples e previsíveis para maior clareza e performance:
 * 1) buscar categorias ativas
 * 2) buscar relações product_categories para obter product_ids por categoria
 * 3) buscar products ativos por listagem de ids
 * 4) buscar product_option_groups, option_groups e options para os product_ids
 */
type GetMenuOpts = {
  signal?: AbortSignal | null
  timeoutMs?: number
  force?: boolean
}

// In-memory cache
let menuCache: { data: MenuCategory[]; ts: number } | null = null
const LOCALSTORAGE_KEY = 'menu_cache_v1'
const DEFAULT_TTL = 1000 * 60 * 10 // 10 minutes

function loadFromLocalStorage(): { data: MenuCategory[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('menu: failed to read localStorage cache', e)
    return null
  }
}

function saveToLocalStorage(payload: { data: MenuCategory[]; ts: number }) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.warn('menu: failed to write localStorage cache', e)
  }
}

async function rawGetMenu(): Promise<MenuCategory[]> {
  // 1) Tenta buscar categorias ativas
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id,name,sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (catError) {
    console.error('menu:getMenu categories error', catError)
    // Don't throw - try fallback instead
  }

  let productIds: string[] = []

  if (categories && categories.length > 0) {
    const categoryIds = categories.map((c: any) => c.id)

    // 2) relações product_categories
    const { data: pcs, error: pcError } = await supabase
      .from('product_categories')
      .select('product_id,category_id')
      .in('category_id', categoryIds)

    if (pcError) {
      console.error('menu:getMenu product_categories error', pcError)
    } else {
      productIds = Array.from(new Set((pcs || []).map((p: any) => p.product_id)))
    }
  }

  // Fallback: if no categories or no products via categories, get all active products
  if (productIds.length === 0) {
    console.log('menu: using fallback - fetching all active products without categories')
    const { data: allProducts, error: allProdError } = await supabase
      .from('products')
      .select('id,name,description,price_cents,original_price_cents,image_url,active,sort_order,created_at')
      .eq('active', true)

    if (allProdError) {
      console.error('menu:getMenu all products fallback error', allProdError)
      return []
    }

    console.log('menu: fallback found', allProducts?.length || 0, 'products')

    // Return all products in a single "Hamburgers" category
    if (!allProducts || allProducts.length === 0) {
      console.warn('menu: fallback found no active products')
      return []
    }

    // Sort by sort_order if available, otherwise by created_at
    const sorted = [...allProducts].sort((a: any, b: any) => {
      if (a.sort_order && b.sort_order) return a.sort_order - b.sort_order
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const allProductsFormatted: MenuProduct[] = sorted.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      price_cents: p.price_cents,
      original_price_cents: p.original_price_cents ?? null,
      image_url: p.image_url ?? null,
      active: p.active,
      sort_order: p.sort_order ?? null,
      option_groups: [],
    }))

    return [{
      id: 'all',
      name: 'Hamburgers',
      sort_order: 1,
      products: allProductsFormatted,
    }]
  }

  // 3) buscar produtos ativos (buscar apenas colunas necessárias)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id,name,description,price_cents,original_price_cents,image_url,active,sort_order,created_at')
    .in('id', productIds)
    .eq('active', true)

  if (prodError) {
    console.error('menu:getMenu products error', prodError)
    throw prodError
  }

  // Map de produtos por id
  const prodMap = new Map<string, any>()
  ;(products || []).forEach((p: any) => prodMap.set(p.id, p))

  // Montar estrutura final sem options por enquanto
  const { data: pcs } = await supabase
    .from('product_categories')
    .select('product_id,category_id')
    .in('category_id', categories!.map((c: any) => c.id))

  const categoriesWithProducts: MenuCategory[] = (categories || []).map((c: any) => {
    const relatedProductIds = (pcs || []).filter((pc: any) => pc.category_id === c.id).map((r: any) => r.product_id)
    const productsForCategory: MenuProduct[] = relatedProductIds
      .map((pid: string) => prodMap.get(pid))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? null,
        price_cents: p.price_cents,
        original_price_cents: p.original_price_cents ?? null,
        image_url: p.image_url ?? null,
        active: p.active,
        sort_order: p.sort_order ?? null,
        option_groups: [],
      }))

    // ordenar por sort_order se disponível
    productsForCategory.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

    return {
      id: c.id,
      name: c.name,
      sort_order: c.sort_order ?? null,
      products: productsForCategory,
    }
  })

  return categoriesWithProducts
}

/**
 * getMenu: wrapper that supports timeout, abort and cache.
 * Returns cached value immediately when available, but still performs
 * a network fetch (SWR) unless `force` is true.
 */
export async function getMenu(opts: GetMenuOpts = {}): Promise<MenuCategory[]> {
  const { signal = null, timeoutMs = 15000, force = false } = opts

  // initialize in-memory cache from localStorage once
  if (!menuCache) {
    try {
      const ls = loadFromLocalStorage()
      if (ls) menuCache = ls
    } catch (e) {}
  }

  const now = Date.now()
  const cachedValid = menuCache && now - menuCache.ts < DEFAULT_TTL

  if (cachedValid && !force) {
    // Return cached immediately
    return menuCache!.data
  }

  // race rawGetMenu with timeout
  const fetchPromise = rawGetMenu()

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let onAbort: (() => void) | null = null

  const timeoutPromise = new Promise<never>((_res, rej) => {
    timeoutId = setTimeout(() => {
      if (timeoutId) clearTimeout(timeoutId)
      rej(new Error('menu:getMenu timeout'))
    }, timeoutMs)

    // if aborted, reject early
    if (signal) {
      onAbort = () => {
        if (timeoutId) clearTimeout(timeoutId)
        rej(new Error('aborted'))
      }

      if (signal.aborted) onAbort()
      else signal.addEventListener('abort', onAbort)
    }
  })

  try {
    const data = await Promise.race([fetchPromise, timeoutPromise])
    // update caches
    menuCache = { data, ts: Date.now() }
    try { saveToLocalStorage(menuCache) } catch (e) {}
    return data
  } catch (err) {
    console.error('menu:getMenu failed', err)
    // fallback to stale cache if available
    if (menuCache) return menuCache.data
    return []
  } finally {
    // cleanup to prevent unobserved rejections from the timeout/abort promises
    try {
      if (signal && onAbort) signal.removeEventListener('abort', onAbort)
    } catch (e) {}
    try {
      if (timeoutId) clearTimeout(timeoutId)
    } catch (e) {}
  }
}