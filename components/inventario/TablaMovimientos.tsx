'use client'

import { formatCOP } from '@/lib/utils'
import { Badge, LoadingRows, EmptyState } from '@/components/ui'
import type { MovimientoInventario, TipoMovimiento } from '@/types'

function badgeTipo(tipo: TipoMovimiento) {
    const config = {
        entrada: { color: 'green' as const, label: '↑ Entrada' },
        salida: { color: 'red' as const, label: '↓ Salida' },
        ajuste: { color: 'blue' as const, label: '⇄ Ajuste' },
    }
    const { color, label } = config[tipo]
    return <Badge color={color}>{label}</Badge>
}

function formatFechaCorta(fecha: string) {
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(fecha))
}

interface TablaMovimientosProps {
    movimientos: MovimientoInventario[]
    loading: boolean
}

export function TablaMovimientos({ movimientos, loading }: TablaMovimientosProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-gray-500 border-b border-gray-800 text-left">
                        {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Descripción'].map(h => (
                            <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>

                {loading ? (
                    <LoadingRows cols={5} />
                ) : movimientos.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={5}>
                                <EmptyState mensaje="No hay movimientos registrados" icono="🏭" />
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody className="divide-y divide-gray-800">
                        {movimientos.map(m => (
                            <tr key={m.id} className="text-gray-300">
                                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap text-xs">
                                    {formatFechaCorta(m.fecha)}
                                </td>
                                <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">
                                    {m.producto?.nombre ?? '—'}
                                </td>
                                <td className="py-3 pr-4">{badgeTipo(m.tipo)}</td>
                                <td className={`py-3 pr-4 font-bold whitespace-nowrap ${m.tipo === 'entrada' ? 'text-green-400' :
                                        m.tipo === 'salida' ? 'text-red-400' : 'text-blue-400'
                                    }`}>
                                    {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '−' : '⇄'}{m.cantidad}
                                </td>
                                <td className="py-3 pr-4 text-gray-500 text-xs max-w-xs truncate">
                                    {m.descripcion ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
        </div>
    )
}