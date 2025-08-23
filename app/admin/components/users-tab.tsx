'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

type User = {
  id: string
  full_name: string
  phone: string
  role: string
  created_at: string
}

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const handler = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (handler.current) clearTimeout(handler.current)
    handler.current = setTimeout(() => setDebouncedValue(value), delay)
    return () => {
      if (handler.current) clearTimeout(handler.current)
    }
  }, [value, delay])

  return debouncedValue
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    fetchUsers(debouncedSearch)
  }, [debouncedSearch])

  const fetchUsers = async (queryText: string = '') => {
    setLoading(true)
    try {
      let query = supabase.from('profiles').select('*')

      if (queryText) {
        query = query.or(
          `full_name.ilike.%${queryText}%,phone.ilike.%${queryText}%,role.ilike.%${queryText}%`
        )
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data as User[])
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR')

  return (
    <div className="flex flex-col gap-6">
      {/* Modern Search Bar */}
      <div className="relative w-full max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou role"
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
              <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide">Telefone</th>
              <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide">Role</th>
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
            ) : users.length > 0 ? (
              users.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`transition-colors duration-200 ${
                    idx % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                  } hover:bg-white/10 cursor-pointer`}
                >
                  <td className="px-6 py-3">{u.full_name}</td>
                  <td className="px-6 py-3">{u.phone}</td>
                  <td className="px-6 py-3 capitalize">{u.role}</td>
                  <td className="px-6 py-3">{formatDate(u.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
