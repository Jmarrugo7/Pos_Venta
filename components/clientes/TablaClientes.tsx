'use client'

import { formatCOP } from '@/lib/utils'
import { Badge, LoadingRows, EmptyState } from '@/components/ui'
import type { Cliente } from '@/types'

interface TablaClientesProps {
    clientes: (Cliente & { activo?: boolean })[]
    loading: boolean
    onVerHistorial: (cliente: Cliente) => void
    onEditar: (cliente: Cliente) => void
    onEliminar: (cliente: Cliente) => void
}

export function TablaClientes({ clientes, loading, onVerHistorial, onEditar, onEliminar }: TablaClientesProps) {
    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                            {['Cliente', 'Estado', 'Saldo Pendiente', 'Acciones'].map(h => (
                                <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <LoadingRows cols={4} />
                </table>
            </div>
        )
    }

    if (clientes.length === 0) {
        return <EmptyState mensaje="No se encontraron clientes registrados" icono="👥" />
    }

    return (
        <>
            {/* ── Vista móvil: tarjetas ─────────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {clientes.map(c => (
                    <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0">
                                <p className="text-white font-semibold truncate">{c.nombre}</p>
                                <p className={`text-sm font-bold mt-0.5 ${c.saldo_pendiente > 0 ? 'text-red-400' : c.saldo_pendiente < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                    {formatCOP(Math.abs(c.saldo_pendiente))}
                                    {c.saldo_pendiente > 0 && <span className="text-gray-600 font-normal text-xs"> pendiente</span>}
                                    {c.saldo_pendiente < 0 && <span className="text-green-600/70 font-normal text-xs"> a favor</span>}
                                </p>
                            </div>
                            <Badge color={c.activo !== false ? 'green' : 'red'}>
                                {c.activo !== false ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-800">
                            <button
                                onClick={() => onVerHistorial(c)}
                                className="flex-1 text-xs bg-gray-800 text-gray-300 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition text-center"
                            >
                                📋 Historial
                            </button>
                            <button
                                onClick={() => onEditar(c)}
                                className="flex-1 text-xs bg-blue-950 text-blue-400 border border-blue-900 px-2 py-1.5 rounded-lg hover:bg-blue-900 transition text-center"
                            >
                                ✏️ Editar
                            </button>
                            <button
                                onClick={() => onEliminar(c)}
                                className="flex-1 text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-1.5 rounded-lg hover:bg-red-900 transition text-center"
                            >
                                🗑️ Borrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Vista desktop: tabla ──────────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                            {['Cliente', 'Estado', 'Saldo Pendiente', 'Acciones'].map(h => (
                                <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {clientes.map(c => (
                            <tr key={c.id} className="text-gray-300 hover:bg-gray-900/50 transition">
                                <td className="py-3 pr-4 text-white font-medium">{c.nombre}</td>
                                <td className="py-3 pr-4">
                                    <Badge color={c.activo !== false ? 'green' : 'red'}>
                                        {c.activo !== false ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </td>
                                <td className={`py-3 pr-4 font-bold ${c.saldo_pendiente > 0 ? 'text-red-400' : c.saldo_pendiente < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                    {formatCOP(Math.abs(c.saldo_pendiente))}
                                    {c.saldo_pendiente < 0 && <span className="text-green-600/70 font-normal text-xs ml-1">a favor</span>}
                                </td>
                                <td className="py-3 pr-4 space-x-2">
                                    <button
                                        onClick={() => onVerHistorial(c)}
                                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition"
                                    >
                                        📋 Historial
                                    </button>
                                    <button
                                        onClick={() => onEditar(c)}
                                        className="text-xs bg-blue-950 text-blue-400 border border-blue-900 px-2 py-1 rounded hover:bg-blue-900 transition"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => onEliminar(c)}
                                        className="text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-1 rounded hover:bg-red-900 transition"
                                    >
                                        🗑️ Borrar
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