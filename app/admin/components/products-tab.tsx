'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'
import debounce from 'lodash.debounce'

type Product = {
  id: string
  name: string
  price_cents: number
  active: boolean
  created_at: string
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Debounce para evitar buscar a cada tecla
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        fetchProducts(value)
      }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(search)
  }, [search, debouncedSearch])

  const fetchProducts = async (queryText: string = '') => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*')

      if (queryText) {
        const price = Number(queryText)
        const activeSearch = queryText.toLowerCase() === 'sim' ? true : queryText.toLowerCase() === 'não' ? false : null

        if (!isNaN(price)) {
          query = query.or(`price_cents.eq.${price}`)
        }

        if (activeSearch !== null) {
          query = query.or(`active.eq.${activeSearch}`)
        }

        query = query.or(`name.ilike.%${queryText}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data as Product[])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR')

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, preço ou ativo"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-black/80 text-white placeholder-gray-400 rounded-lg border border-white/20 shadow-md focus:outline-none focus:border-[#cc9b3b] focus:ring-1 focus:ring-[#cc9b3b] transition-colors"
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-white/20 bg-black/60 shadow-md">
        <table className="min-w-full text-left text-white">
          <thead className="bg-black/40 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide">Nome</th>
              <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide">Preço</th>
              <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide">Ativo</th>
              <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide">Criado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`transition-colors duration-200 ${
                    idx % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                  } hover:bg-white/10 cursor-pointer`}
                >
                  <td className="px-6 py-3">{p.name}</td>
                  <td className="px-6 py-3">{formatPrice(p.price_cents)}</td>
                  <td className="px-6 py-3">{p.active ? 'Sim' : 'Não'}</td>
                  <td className="px-6 py-3">{formatDate(p.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Nenhum produto encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
