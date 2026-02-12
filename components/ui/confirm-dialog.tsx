'use client'

import React from 'react'

export default function ConfirmDialog({ open, title, description, onConfirm, onClose, confirmLabel = 'Confirmar' }: {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="bg-card rounded p-6 z-10 w-[min(480px,95%)] shadow-lg">
        <h3 id="confirm-title" className="text-lg font-semibold mb-2">{title ?? 'Confirmação'}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description ?? 'Deseja continuar com esta ação?'}</p>
        <div className="flex justify-end gap-2">
          <button aria-label="Cancelar" className="btn" onClick={onClose}>Cancelar</button>
          <button aria-label="Confirmar" className="btn btn-danger" onClick={async () => { await onConfirm(); onClose(); }} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
