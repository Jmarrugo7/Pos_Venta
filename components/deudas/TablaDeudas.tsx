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
        if (monto > 50000) return 'text-red-400'
        if (monto > 20000) return 'text-yellow-400'
        return 'text-orange-400'
    }

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

                {loading ? (
                    <LoadingRows cols={4} />
                ) : clientes.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={4}>
                                <EmptyState mensaje="No hay deudas pendientes" icono="✅" />
                            </td>
                        </tr>
                    </tbody>
                ) : (
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
                                    {formatCOP(c.saldo_pendiente)}
                                </td>
                                <td className="py-4 pr-6">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.saldo_pendiente > 50000
                                            ? 'bg-red-900 text-red-400'
                                            : 'bg-yellow-900 text-yellow-400'
                                        }`}>
                                        {c.saldo_pendiente > 50000 ? 'Deuda alta' : 'Deuda moderada'}
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
                )}
            </table>
        </div>
    )
}