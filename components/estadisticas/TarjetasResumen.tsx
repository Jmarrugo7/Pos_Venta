'use client'

import { formatCOP } from '@/lib/utils'
import type { ResumenStats } from '@/hooks/useEstadisticas'

interface TarjetaProps {
    label: string
    ventas: number
    ganancias: number
    icono: string
    color: string
}

function Tarjeta({ label, ventas, ganancias, icono, color }: TarjetaProps) {
    return (
        <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 border-l-4 ${color}`}>
            <div className="flex justify-between items-start mb-3">
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">{label}</p>
                <span className="text-xl">{icono}</span>
            </div>
            <p className="text-white text-xl font-bold">{formatCOP(ventas)}</p>
            <p className="text-green-400 text-sm mt-1">
                Ganancia: <span className="font-semibold">{formatCOP(ganancias)}</span>
            </p>
        </div>
    )
}

interface TarjetasResumenProps {
    resumen: ResumenStats
    productosAgotados: number
}

export function TarjetasResumen({ resumen, productosAgotados }: TarjetasResumenProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Tarjeta label="Hoy" ventas={resumen.ventasHoy} ganancias={resumen.gananciaHoy} icono="📅" color="border-l-blue-500" />
            <Tarjeta label="Esta semana" ventas={resumen.ventasSemana} ganancias={resumen.gananciaSemana} icono="📆" color="border-l-purple-500" />
            <Tarjeta label="Este mes" ventas={resumen.ventasMes} ganancias={resumen.gananciaMes} icono="🗓️" color="border-l-orange-500" />
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 border-l-4 border-l-green-500">
                <div className="flex justify-between items-start mb-3">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Total histórico</p>
                    <span className="text-xl">💰</span>
                </div>
                <p className="text-white text-xl font-bold">{formatCOP(resumen.totalVentas)}</p>
                <p className="text-green-400 text-sm mt-1">
                    Ganancia total: <span className="font-semibold">{formatCOP(resumen.totalGanancias)}</span>
                </p>
                {productosAgotados > 0 && (
                    <p className="text-red-400 text-xs mt-2">⚠ {productosAgotados} producto{productosAgotados > 1 ? 's' : ''} agotado{productosAgotados > 1 ? 's' : ''}</p>
                )}
            </div>
        </div>
    )
}