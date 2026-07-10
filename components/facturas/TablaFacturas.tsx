'use client'

import { formatCOP, formatNumeroFactura } from '@/lib/utils'
import { Badge, LoadingRows, EmptyState } from '@/components/ui'
import type { Factura } from '@/types/facturas'

function formatFecha(fecha: string) {
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(fecha))
}

interface TablaFacturasProps {
    facturas: Factura[]
    loading: boolean
    onVerDetalle: (factura: Factura) => void
    onDescargarPDF: (factura: Factura) => void
    onAnular: (factura: Factura) => void
}

export function TablaFacturas({ facturas, loading, onVerDetalle, onDescargarPDF, onAnular }: TablaFacturasProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-gray-500 border-b border-gray-800 text-left">
                        {['N° Factura', 'Fecha', 'Cliente', 'Tipo pago', 'Total', 'Estado', 'Acciones'].map(h => (
                            <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                {loading ? (
                    <LoadingRows cols={7} />
                ) : facturas.length === 0 ? (
                    <tbody><tr><td colSpan={7}>
                        <EmptyState mensaje="No se encontraron facturas" icono="🧾" />
                    </td></tr></tbody>
                ) : (
                    <tbody className="divide-y divide-gray-800">
                        {facturas.map(f => (
                            <tr key={f.id} className={`text-gray-300 transition ${f.estado === 'anulada' ? 'opacity-50' : 'hover:bg-gray-900/50'}`}>
                                <td className="py-3 pr-4">
                                    <button onClick={() => onVerDetalle(f)} className="text-white font-bold hover:text-red-400 transition">
                                        {formatNumeroFactura(f.numero_factura)}
                                    </button>
                                </td>
                                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{formatFecha(f.fecha)}</td>
                                <td className="py-3 pr-4 text-white">
                                    {f.cliente?.nombre ?? <span className="text-gray-600 italic">Sin cliente</span>}
                                </td>
                                <td className="py-3 pr-4">
                                    <Badge color={f.tipo === 'contado' ? 'green' : 'yellow'}>
                                        {f.tipo === 'contado' ? 'Contado' : 'Crédito'}
                                    </Badge>
                                </td>
                                <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">{formatCOP(f.total)}</td>
                                <td className="py-3 pr-4">
                                    <Badge color={f.estado === 'activa' ? 'green' : 'red'}>
                                        {f.estado === 'activa' ? 'Activa' : 'Anulada'}
                                    </Badge>
                                </td>
                                <td className="py-3 flex gap-2 flex-wrap">
                                    <button onClick={() => onVerDetalle(f)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition">👁 Ver</button>
                                    <button onClick={() => onDescargarPDF(f)} className="text-xs bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-900 px-2 py-1 rounded transition">📄 PDF</button>
                                    {f.estado === 'activa' && (
                                        <button onClick={() => onAnular(f)} className="text-xs bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 px-2 py-1 rounded transition">🚫 Anular</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
        </div>
    )
}