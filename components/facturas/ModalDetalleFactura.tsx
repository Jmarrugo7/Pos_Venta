'use client'

import { formatCOP, formatNumeroFactura } from '@/lib/utils'
import { Badge } from '@/components/ui'
import type { Factura } from '@/types/facturas'

function formatFechaLarga(fecha: string) {
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(fecha))
}

interface ModalDetalleFacturaProps {
    factura: Factura | null
    onCerrar: () => void
    onDescargarPDF: (factura: Factura) => void
    onImprimir: (factura: Factura) => void
}

export function ModalDetalleFactura({ factura, onCerrar, onDescargarPDF, onImprimir }: ModalDetalleFacturaProps) {
    if (!factura) return null

    const subtotales = factura.items ?? []
    const totalItems = subtotales.reduce((s, i) => s + i.cantidad, 0)

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-40" onClick={onCerrar} />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl overflow-y-auto">

                {/* Header */}
                <div className="bg-red-600 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-red-200 text-xs font-medium uppercase tracking-wider">Factura de Venta</p>
                            <h2 className="text-white text-3xl font-black mt-1">{formatNumeroFactura(factura.numero_factura)}</h2>
                            <p className="text-red-200 text-sm mt-1">{formatFechaLarga(factura.fecha)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge color={factura.estado === 'activa' ? 'green' : 'red'}>
                                {factura.estado === 'activa' ? 'Activa' : 'Anulada'}
                            </Badge>
                            <button onClick={onCerrar} className="text-red-200 hover:text-white text-2xl leading-none transition">✕</button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Info cliente y pago */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cliente</p>
                            <p className="text-white font-semibold">
                                {factura.cliente?.nombre ?? 'Consumidor final'}
                            </p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Tipo de pago</p>
                            <Badge color={factura.tipo === 'contado' ? 'green' : 'yellow'}>
                                {factura.tipo === 'contado' ? 'Contado' : 'Crédito'}
                            </Badge>
                        </div>
                    </div>

                    {/* Productos */}
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">
                            Productos ({totalItems} unidades)
                        </p>
                        <div className="space-y-2">
                            {subtotales.map((item, i) => (
                                <div key={i} className="bg-gray-800 rounded-xl px-4 py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">{item.producto?.nombre ?? '—'}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {item.cantidad} × {formatCOP(item.precio_unitario)}
                                            </p>
                                        </div>
                                        <p className="text-white font-bold text-sm ml-3 shrink-0">
                                            {formatCOP(item.precio_unitario * item.cantidad)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-red-950 border border-red-900 rounded-xl px-5 py-4 flex justify-between items-center">
                        <p className="text-gray-400 font-medium">Total</p>
                        <p className="text-white text-2xl font-black">{formatCOP(factura.total)}</p>
                    </div>

                    {/* Nota de anulación */}
                    {factura.estado === 'anulada' && (
                        <div className="bg-red-950 border border-red-900 rounded-xl px-4 py-3">
                            <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Factura anulada</p>
                            {factura.motivo_anulacion && (
                                <p className="text-red-300 text-sm">Motivo: {factura.motivo_anulacion}</p>
                            )}
                            {factura.anulada_en && (
                                <p className="text-red-400 text-xs mt-1">{formatFechaLarga(factura.anulada_en)}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="p-6 border-t border-gray-800 flex gap-3">
                    <button
                        onClick={() => onDescargarPDF(factura)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition"
                    >
                        📄 Descargar PDF
                    </button>
                    <button
                        onClick={() => onImprimir(factura)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition"
                    >
                        🖨️ Imprimir
                    </button>
                </div>
            </div>
        </>
    )
}