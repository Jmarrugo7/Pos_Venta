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
    if (loading) {
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
                    <LoadingRows cols={5} />
                </table>
            </div>
        )
    }

    if (movimientos.length === 0) {
        return <EmptyState mensaje="No hay movimientos registrados" icono="🏭" />
    }

    return (
        <>
            {/* ── Vista móvil: tarjetas ─────────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {movimientos.map(m => (
                    <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-white font-medium text-sm">{m.producto?.nombre ?? '—'}</p>
                            <div className="shrink-0">{badgeTipo(m.tipo)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{formatFechaCorta(m.fecha)}</span>
                            <span className={`font-bold text-sm ${
                                m.tipo === 'entrada' ? 'text-green-400' :
                                m.tipo === 'salida' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                                {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '−' : '⇄'}{m.cantidad}
                            </span>
                        </div>
                        {m.descripcion && (
                            <p className="text-gray-600 text-xs mt-1.5 truncate">{m.descripcion}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Vista desktop: tabla ──────────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                            {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Descripción'].map(h => (
                                <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
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
                </table>
            </div>
        </>
    )
}