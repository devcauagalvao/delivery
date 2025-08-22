'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

type User = { id: string, full_name: string, phone: string, role: string, created_at: string }

export default function UsersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [search])

    const fetchUsers = async () => {
        let query = supabase.from('profiles').select('*')
        if (search) {
            query = query.or(
                `full_name.ilike.%${search}%,phone.ilike.%${search}%,role.ilike.%${search}%`
            )
        }
        const { data, error } = await query
        if (!error) setUsers(data as User[])
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
                    <thead className="bg-white border-b border-gray-300">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Nome</th>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Telefone</th>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Role</th>
                            <th className="px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black">Criado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((u, idx) => (
                                <tr
                                    key={u.id}
                                    className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                                        } hover:bg-white/10`}
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
