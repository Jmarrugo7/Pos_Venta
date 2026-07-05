'use client'

import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import { useAbonosCliente } from '@/hooks/useDeudas'
import type { Cliente } from '@/types'

function formatFecha(fecha: string) {
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(fecha))
}

interface ModalAbonoProps {
    abierto: boolean
    cliente: Cliente | null
    onAbonar: (clienteId: string, monto: number) => Promise<void>
    onCerrar: () => void
}

export function ModalAbono({ abierto, cliente, onAbonar, onCerrar }: ModalAbonoProps) {
    const [monto, setMonto] = useState('')
    const [pagando, setPagando] = useState(false)
    const [error, setError] = useState('')
    const [exito, setExito] = useState(false)
    const { abonos, loading: loadingAbonos } = useAbonosCliente(abierto ? cliente?.id ?? null : null)

    useEffect(() => {
        if (!abierto) {
            setMonto('')
            setError('')
            setExito(false)
        }
    }, [abierto])

    async function handleAbonar() {
        const valor = Number(monto)
        if (!valor || valor <= 0) return setError('Ingresa un monto válido')
        if (!cliente) return
        if (valor > cliente.saldo_pendiente) return setError(`El monto supera la deuda (${formatCOP(cliente.saldo_pendiente)})`)

        setPagando(true)
        setError('')
        try {
            await onAbonar(cliente.id, valor)
            setMonto('')
            setExito(true)
            setTimeout(() => setExito(false), 2000)
        } catch (e) {
            setError((e as Error).message || 'Error al registrar abono')
        } finally {
            setPagando(false)
        }
    }

    if (!cliente) return null

    const saldoRestante = cliente.saldo_pendiente - (Number(monto) || 0)

    return (
        <Modal
            abierto={abierto}
            onCerrar={onCerrar}
            titulo={`Abono — ${cliente.nombre}`}
        >
            {/* Deuda actual */}
            <div className="bg-red-950 border border-red-900 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-xs uppercase tracking-wider font-medium">Deuda actual</p>
                <p className="text-red-300 text-3xl font-bold mt-1">
                    {formatCOP(cliente.saldo_pendiente)}
                </p>
            </div>

            {/* Input monto */}
            <div className="mb-3">
                <label className="block text-gray-400 text-sm mb-1">Monto del abono</label>
                <input
                    type="number"
                    value={monto}
                    onChange={e => { setMonto(e.target.value); setError(''); setExito(false) }}
                    placeholder="0"
                    min={0}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                    onKeyDown={e => e.key === 'Enter' && handleAbonar()}
                    autoFocus
                />
            </div>

            {/* Atajos rápidos */}
            <div className="flex gap-2 mb-4">
                {[0.25, 0.5, 1].map(pct => (
                    <button
                        key={pct}
                        onClick={() => setMonto(String(Math.floor(cliente.saldo_pendiente * pct)))}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs py-1.5 rounded-lg transition"
                    >
                        {pct === 1 ? 'Total' : `${pct * 100}%`}
                    </button>
                ))}
            </div>

            {/* Preview saldo restante */}
            {Number(monto) > 0 && Number(monto) <= cliente.saldo_pendiente && (
                <div className={`rounded-lg px-4 py-3 text-sm flex justify-between mb-4 ${saldoRestante === 0
                        ? 'bg-green-950 border border-green-900'
                        : 'bg-gray-800 border border-gray-700'
                    }`}>
                    <span className="text-gray-400">Saldo restante</span>
                    <span className={`font-bold ${saldoRestante === 0 ? 'text-green-400' : 'text-white'}`}>
                        {saldoRestante === 0 ? '✓ Saldado' : formatCOP(saldoRestante)}
                    </span>
                </div>
            )}

            {error && (
                <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-3 py-2 mb-4">
                    {error}
                </p>
            )}

            {exito && (
                <p className="text-green-400 text-sm bg-green-950 border border-green-900 rounded-lg px-3 py-2 mb-4">
                    ✓ Abono registrado correctamente
                </p>
            )}

            <Button className="w-full mb-6" onClick={handleAbonar} disabled={pagando}>
                {pagando ? 'Registrando...' : 'Registrar abono'}
            </Button>

            {/* Historial de abonos */}
            <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">
                    Historial de abonos ({abonos.length})
                </p>
                {loadingAbonos ? (
                    <div className="space-y-2">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : abonos.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-4">Sin abonos registrados</p>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {abonos.map(a => (
                            <div key={a.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2">
                                <span className="text-gray-500 text-xs">{formatFecha(a.fecha)}</span>
                                <span className="text-green-400 text-sm font-medium">+{formatCOP(a.monto)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    )
}