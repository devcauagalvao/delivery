'use client'

import React, { useMemo, useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { useClients } from '@/hooks/use-clients'
import ClientForm from '@/components/admin/client-form'
import { useToast } from '@/hooks/use-toast'
import ConfirmDialog from '@/components/ui/confirm-dialog'

export default function AdminClientsPage() {
  const { data, loading, error, page, total, pageSize, search, setSearch, goToPage, refresh, createClient, updateClient, deleteClient } = useClients({ pageSize: 12 })
  const [editing, setEditing] = useState<any | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { toast } = useToast()

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total ?? 0) / pageSize)), [total, pageSize])

  async function onCreate(values: any) {
    try {
      await createClient(values)
      setShowCreate(false)
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Falha ao criar cliente' })
      throw err
    }
  }

  async function onUpdate(values: any) {
    if (!editing) return
    try {
      await updateClient(editing.id, values)
      setEditing(null)
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Falha ao atualizar cliente' })
      throw err
    }
  }

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [toDeleteId, setToDeleteId] = React.useState<string | null>(null)

  async function onDelete(id: string) {
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  async function handleDeleteConfirmed() {
    if (!toDeleteId) return
    try {
      // optimistic UI: immediately show toast and refresh after deletion
      toast({ title: 'Removendo...', description: 'Aguarde' })
      await deleteClient(toDeleteId)
      toast({ title: 'Sucesso', description: 'Cliente removido' })
      setToDeleteId(null)
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Falha ao remover cliente' })
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <div className="flex items-center gap-3">
            <input value={search ?? ''} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone" className="input" />
            <button className="btn" onClick={() => { setShowCreate(true) }}>Novo</button>
            <button className="btn" onClick={() => refresh()}>Atualizar</button>
          </div>
        </div>

        <div className="bg-surface rounded border p-4">
          {loading && <div className="p-8 text-center">Carregando...</div>}
          {error && <div className="p-8 text-center text-red-400">{error.message}</div>}

          {!loading && (data == null || data.length === 0) && <div className="p-8 text-center text-muted-foreground">Nenhum cliente encontrado.</div>}

          {!loading && (data ?? []).length > 0 && (
            <div className="space-y-3">
              {(data ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-sm text-muted-foreground">{c.phone ?? '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs px-2 py-1 rounded bg-[#111]/20">{c.role}</div>
                    <button className="btn btn-ghost" onClick={() => setEditing(c)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => onDelete(c.id)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total: {total}</div>
            <div className="flex items-center gap-2">
              <button className="btn" onClick={() => goToPage(Math.max(1, page - 1))} disabled={page <= 1}>Anterior</button>
              <div className="px-3">{page} / {totalPages}</div>
              <button className="btn" onClick={() => goToPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Próxima</button>
            </div>
          </div>
        </div>

        {/* Create modal-like inline area */}
        {showCreate && (
          <div className="mt-6 p-4 border rounded bg-card">
            <div className="flex justify-between items-center mb-3">
              <strong>Criar cliente</strong>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Fechar</button>
            </div>
            <ClientForm onSubmit={onCreate} />
          </div>
        )}

        {/* Edit area */}
        {editing && (
          <div className="mt-6 p-4 border rounded bg-card">
            <div className="flex justify-between items-center mb-3">
              <strong>Editar cliente</strong>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Fechar</button>
            </div>
            <ClientForm initial={{ full_name: editing.full_name, phone: editing.phone, role: editing.role }} onSubmit={onUpdate} submitLabel="Atualizar" />
          </div>
        )}

        <ConfirmDialog open={confirmOpen} title="Remover cliente" description="Confirma remoção do cliente? Esta ação é irreversível." onConfirm={handleDeleteConfirmed} onClose={() => { setConfirmOpen(false); setToDeleteId(null) }} />
      </div>
    </ProtectedRoute>
  )
}
