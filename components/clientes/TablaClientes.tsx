'use client'

import { formatCOP } from '@/lib/utils'
import { Badge, LoadingRows, EmptyState } from '@/components/ui'
import type { Cliente } from '@/types'

interface TablaClientesProps {
    clientes: (Cliente & { activo?: boolean })[]
    loading: boolean
    onVerHistorial: (cliente: Cliente) => void
    onEditar: (cliente: Cliente) => void
    onEliminar: (cliente: Cliente) => void  // ahora recibe el objeto completo
}

export function TablaClientes({ clientes, loading, onVerHistorial, onEditar, onEliminar }: TablaClientesProps) {
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

                {loading ? (
                    <LoadingRows cols={4} />
                ) : clientes.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={4}>
                                <EmptyState mensaje="No se encontraron clientes registrados" icono="👥" />
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody className="divide-y divide-gray-800">
                        {clientes.map(c => (
                            <tr key={c.id} className="text-gray-300 hover:bg-gray-900/50 transition">
                                <td className="py-3 pr-4 text-white font-medium">{c.nombre}</td>
                                <td className="py-3 pr-4">
                                    <Badge color={c.activo !== false ? 'green' : 'red'}>
                                        {c.activo !== false ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </td>
                                <td className={`py-3 pr-4 font-bold ${c.saldo_pendiente > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {formatCOP(c.saldo_pendiente)}
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
                )}
            </table>
        </div>
    )
}