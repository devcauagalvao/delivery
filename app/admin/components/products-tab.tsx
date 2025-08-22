'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

type Product = { id: string; name: string; price_cents: number; active: boolean; created_at: string }

export default function ProductsTab() {
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [search])

    const fetchProducts = async () => {
        let query = supabase.from('products').select('*')
        if (search) {
            query = query.or(`name.ilike.%${search}%,price_cents.ilike.%${search}%,active.ilike.%${search}%`)
        }
        const { data, error } = await query
        if (!error) setProducts(data as Product[])
    }

    const formatPrice = (cents: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR')

    return (
        <div className="flex flex-col gap-6">
            {/* Modern Search Bar */}
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
                    <thead className="bg-white border-b border-gray-300">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Nome</th>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Preço</th>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Ativo</th>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Criado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((p, idx) => (
                                <tr
                                    key={p.id}
                                    className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                                        } hover:bg-white/10`}
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
