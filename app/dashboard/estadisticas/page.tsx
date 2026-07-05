'use client'

import { useState } from 'react'
import { useEstadisticas } from '@/hooks/useEstadisticas'
import { TarjetasResumen } from '@/components/estadisticas/TarjetasResumen'
import { GraficaVentas } from '@/components/estadisticas/GraficaVentas'
import { GraficaProductos } from '@/components/estadisticas/GraficaProductos'
import { TablaClientesTop } from '@/components/estadisticas/TablaClientesTop'
import { PageHeader } from '@/components/ui'
import { fechaHoy, inicioMes } from '@/lib/utils'

const RANGOS = [
    { label: 'Hoy', desde: () => fechaHoy(), hasta: () => fechaHoy() },
    {
        label: 'Esta semana', desde: () => {
            const hoy = new Date()
            const dia = hoy.getDay()
            const lunes = new Date(hoy)
            lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1))
            return lunes.toISOString().split('T')[0]
        }, hasta: () => fechaHoy()
    },
    { label: 'Este mes', desde: () => inicioMes(), hasta: () => fechaHoy() },
    {
        label: 'Últimos 3 meses', desde: () => {
            const d = new Date()
            d.setMonth(d.getMonth() - 3)
            return d.toISOString().split('T')[0]
        }, hasta: () => fechaHoy()
    },
    { label: 'Personalizado', desde: () => inicioMes(), hasta: () => fechaHoy() },
]

export default function EstadisticasPage() {
    const [rangoIdx, setRangoIdx] = useState(2) // Este mes por defecto
    const [desdeCustom, setDesdeCustom] = useState(inicioMes())
    const [hastaCustom, setHastaCustom] = useState(fechaHoy())

    const esPersonalizado = rangoIdx === 4
    const desde = esPersonalizado ? desdeCustom : RANGOS[rangoIdx].desde()
    const hasta = esPersonalizado ? hastaCustom : RANGOS[rangoIdx].hasta()

    const {
        resumen, ventasDiarias, productosMasVendidos,
        productosMenosVendidos, clientesTop, productosAgotados, loading,
    } = useEstadisticas(desde, hasta)

    return (
        <div>
            <PageHeader titulo="Estadísticas" subtitulo="Análisis de ventas y rendimiento del negocio" />

            {/* Selector de rango */}
            <div className="flex flex-wrap gap-2 mb-6">
                {RANGOS.map((r, i) => (
                    <button
                        key={r.label}
                        onClick={() => setRangoIdx(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${rangoIdx === i
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                            }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Filtro personalizado */}
            {esPersonalizado && (
                <div className="flex gap-3 mb-6 items-center flex-wrap">
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Desde</label>
                        <input
                            type="date"
                            value={desdeCustom}
                            onChange={e => setDesdeCustom(e.target.value)}
                            className="bg-gray-900 text-white border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Hasta</label>
                        <input
                            type="date"
                            value={hastaCustom}
                            onChange={e => setHastaCustom(e.target.value)}
                            className="bg-gray-900 text-white border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div className="text-gray-600 text-xs self-end pb-2">
                        {desde} → {hasta}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-28 bg-gray-900 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-80 bg-gray-900 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-72 bg-gray-900 rounded-xl animate-pulse" />
                        <div className="h-72 bg-gray-900 rounded-xl animate-pulse" />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tarjetas resumen */}
                    {resumen && (
                        <TarjetasResumen resumen={resumen} productosAgotados={productosAgotados} />
                    )}

                    {/* Gráfica de ventas */}
                    <GraficaVentas datos={ventasDiarias} />

                    {/* Productos más y menos vendidos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GraficaProductos
                            datos={productosMasVendidos}
                            titulo="Productos más vendidos"
                        />
                        <GraficaProductos
                            datos={productosMenosVendidos}
                            titulo="Productos menos vendidos"
                            color="#6b7280"
                        />
                    </div>

                    {/* Clientes top */}
                    <TablaClientesTop clientes={clientesTop} />
                </div>
            )}
        </div>
    )
}