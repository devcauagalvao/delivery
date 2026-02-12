import React from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/protected-route'

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/clients" className="card p-4">
            <h3 className="font-semibold">Clientes</h3>
            <p className="text-sm text-muted-foreground">Gerenciar clientes (CRUD, busca, paginação)</p>
          </Link>
          <Link href="/admin/orders" className="card p-4 opacity-60 pointer-events-none">
            <h3 className="font-semibold">Pedidos</h3>
            <p className="text-sm text-muted-foreground">(não implementado aqui)</p>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  )
}
