'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { formatCOP, formatNumeroFactura } from '@/lib/utils'
import type { Factura } from '@/types/facturas'

interface ModalAnularProps {
    factura: Factura | null
    onAnular: (id: string, motivo: string) => Promise<void>
    onCerrar: () => void
}

export function ModalAnular({ factura, onAnular, onCerrar }: ModalAnularProps) {
    const [motivo, setMotivo] = useState('')
    const [anulando, setAnulando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!factura) { setMotivo(''); setError('') }
    }, [factura])

    if (!factura) return null

    async function handleAnular() {
        if (!motivo.trim()) return setError('El motivo de anulación es obligatorio')
        setAnulando(true)
        setError('')
        try {
            await onAnular(factura!.id, motivo)
            onCerrar()
        } catch (e) {
            setError((e as Error).message || 'Error al anular')
        } finally {
            setAnulando(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl">
                <div className="w-12 h-12 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚫</span>
                </div>
                <h3 className="text-white font-bold text-lg text-center mb-1">Anular factura</h3>
                <p className="text-gray-500 text-sm text-center mb-1">
                    {formatNumeroFactura(factura.numero_factura)} — {formatCOP(factura.total)}
                </p>
                <p className="text-yellow-400 text-xs text-center mb-5">
                    ⚠ Se revertirá el inventario automáticamente
                </p>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Motivo de anulación</label>
                    <textarea
                        value={motivo}
                        onChange={e => { setMotivo(e.target.value); setError('') }}
                        placeholder="Ej: Error en el producto, devolución del cliente..."
                        rows={3}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                        autoFocus
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={onCerrar} disabled={anulando}>
                        Cancelar
                    </Button>
                    <Button variant="danger" className="flex-1 !bg-red-600 hover:!bg-red-500 !text-white" onClick={handleAnular} disabled={anulando}>
                        {anulando ? 'Anulando...' : 'Confirmar anulación'}
                    </Button>
                </div>
            </div>
        </div>
    )
}