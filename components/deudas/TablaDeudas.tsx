'use client'

import { formatCOP } from '@/lib/utils'
import { LoadingRows, EmptyState } from '@/components/ui'
import type { Cliente } from '@/types'

interface TablaDeudasProps {
    clientes: Cliente[]
    loading: boolean
    onVerDetalle: (cliente: Cliente) => void
    onAbonar: (cliente: Cliente) => void
}

export function TablaDeudas({ clientes, loading, onVerDetalle, onAbonar }: TablaDeudasProps) {
    function colorDeuda(monto: number) {
        if (monto < 0) return 'text-green-400'
        if (monto > 50000) return 'text-red-400'
        if (monto > 20000) return 'text-yellow-400'
        return 'text-orange-400'
    }

    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                            {['Cliente', 'Deuda pendiente', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="pb-3 pr-6 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <LoadingRows cols={4} />
                </table>
            </div>
        )
    }

    if (clientes.length === 0) {
        return <EmptyState mensaje="No hay deudas pendientes" icono="✅" />
    }

    return (
        <>
            {/* ── Vista móvil: tarjetas ─────────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {clientes.map(c => (
                    <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <button
                                onClick={() => onVerDetalle(c)}
                                className="text-white font-semibold hover:text-red-400 transition text-left text-sm"
                            >
                                {c.nombre}
                            </button>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                                c.saldo_pendiente < 0
                                    ? 'bg-green-900 text-green-400'
                                    : c.saldo_pendiente > 50000
                                    ? 'bg-red-900 text-red-400'
                                    : 'bg-yellow-900 text-yellow-400'
                            }`}>
                                {c.saldo_pendiente < 0 ? 'Saldo a favor' : c.saldo_pendiente > 50000 ? 'Deuda alta' : 'Deuda moderada'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className={`font-bold text-lg ${colorDeuda(c.saldo_pendiente)}`}>
                                {formatCOP(Math.abs(c.saldo_pendiente))}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onAbonar(c)}
                                    className="text-green-400 hover:text-green-300 text-xs font-medium transition"
                                >
                                    + Abonar
                                </button>
                                <button
                                    onClick={() => onVerDetalle(c)}
                                    className="text-blue-400 hover:text-blue-300 text-xs transition"
                                >
                                    Ver historial
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Vista desktop: tabla ──────────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                            {['Cliente', 'Deuda pendiente', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="pb-3 pr-6 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {clientes.map(c => (
                            <tr key={c.id} className="text-gray-300 hover:bg-gray-900/50 transition">
                                <td className="py-4 pr-6">
                                    <button
                                        onClick={() => onVerDetalle(c)}
                                        className="text-white font-medium hover:text-red-400 transition text-left"
                                    >
                                        {c.nombre}
                                    </button>
                                </td>
                                <td className={`py-4 pr-6 font-bold text-base ${colorDeuda(c.saldo_pendiente)}`}>
                                    {formatCOP(Math.abs(c.saldo_pendiente))}
                                </td>
                                <td className="py-4 pr-6">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        c.saldo_pendiente < 0
                                            ? 'bg-green-900 text-green-400'
                                            : c.saldo_pendiente > 50000
                                            ? 'bg-red-900 text-red-400'
                                            : 'bg-yellow-900 text-yellow-400'
                                        }`}>
                                        {c.saldo_pendiente < 0 ? 'Saldo a favor' : c.saldo_pendiente > 50000 ? 'Deuda alta' : 'Deuda moderada'}
                                    </span>
                                </td>
                                <td className="py-4 flex gap-3">
                                    <button
                                        onClick={() => onAbonar(c)}
                                        className="text-green-400 hover:text-green-300 text-xs font-medium transition"
                                    >
                                        + Abonar
                                    </button>
                                    <button
                                        onClick={() => onVerDetalle(c)}
                                        className="text-blue-400 hover:text-blue-300 text-xs transition"
                                    >
                                        Ver historial
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}