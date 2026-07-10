'use client'

import { useState } from 'react'
import { useFacturas } from '@/hooks/useFacturas'
import { TablaFacturas } from '@/components/facturas/TablaFacturas'
import { ModalDetalleFactura } from '@/components/facturas/ModalDetalleFactura'
import { ModalAnular } from '@/components/facturas/ModalAnular'
import { PageHeader } from '@/components/ui'
import { generarPDFFactura } from '@/lib/generarPDF'
import { formatCOP } from '@/lib/utils'
import type { Factura } from '@/types/facturas'

export default function FacturasPage() {
    const { facturas, loading, filtros, setFiltros, anularFactura } = useFacturas()
    const [facturaDetalle, setFacturaDetalle] = useState<Factura | null>(null)
    const [facturaAnular, setFacturaAnular] = useState<Factura | null>(null)

    const activas = facturas.filter(f => f.estado === 'activa').length
    const anuladas = facturas.filter(f => f.estado === 'anulada').length
    const totalActivas = facturas
        .filter(f => f.estado === 'activa')
        .reduce((s, f) => s + f.total, 0)

    function handleImprimir(factura: Factura) {
        generarPDFFactura(factura)
        setTimeout(() => window.print(), 500)
    }

    return (
        <div>
            <PageHeader
                titulo="Facturas"
                subtitulo={`${facturas.length} facturas encontradas`}
            />

            {/* Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 border-l-4 border-l-green-500">
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Facturas activas</p>
                    <p className="text-white text-2xl font-bold mt-1">{activas}</p>
                    <p className="text-green-400 text-xs mt-1">{formatCOP(totalActivas)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 border-l-4 border-l-red-500">
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Anuladas</p>
                    <p className="text-white text-2xl font-bold mt-1">{anuladas}</p>
                    <p className="text-gray-600 text-xs mt-1">No afectan inventario</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 border-l-4 border-l-blue-500 col-span-2 md:col-span-1">
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Total facturado</p>
                    <p className="text-white text-2xl font-bold mt-1">{formatCOP(totalActivas)}</p>
                    <p className="text-gray-600 text-xs mt-1">Solo facturas activas</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Filtros de búsqueda</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        type="text"
                        placeholder="N° factura, cliente, fecha..."
                        value={filtros.busqueda}
                        onChange={e => setFiltros(f => ({ ...f, busqueda: e.target.value }))}
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                    />
                    <select
                        value={filtros.estado}
                        onChange={e => setFiltros(f => ({ ...f, estado: e.target.value as any }))}
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                    >
                        <option value="todas">Todos los estados</option>
                        <option value="activa">Activas</option>
                        <option value="anulada">Anuladas</option>
                    </select>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Desde</label>
                        <input
                            type="date"
                            value={filtros.desde}
                            onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Hasta</label>
                        <input
                            type="date"
                            value={filtros.hasta}
                            onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                </div>
                {(filtros.busqueda || filtros.estado !== 'todas' || filtros.desde || filtros.hasta) && (
                    <button
                        onClick={() => setFiltros({ busqueda: '', estado: 'todas', desde: '', hasta: '' })}
                        className="text-gray-500 hover:text-white text-xs mt-3 transition"
                    >
                        Limpiar filtros ✕
                    </button>
                )}
            </div>

            {/* Tabla */}
            <TablaFacturas
                facturas={facturas}
                loading={loading}
                onVerDetalle={setFacturaDetalle}
                onDescargarPDF={generarPDFFactura}
                onAnular={setFacturaAnular}
            />

            {/* Panel detalle */}
            <ModalDetalleFactura
                factura={facturaDetalle}
                onCerrar={() => setFacturaDetalle(null)}
                onDescargarPDF={generarPDFFactura}
                onImprimir={handleImprimir}
            />

            {/* Modal anular */}
            <ModalAnular
                factura={facturaAnular}
                onAnular={anularFactura}
                onCerrar={() => setFacturaAnular(null)}
            />
        </div>
    )
}