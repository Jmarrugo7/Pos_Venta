'use client'

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { formatCOP } from '@/lib/utils'
import type { ProductoStat } from '@/hooks/useEstadisticas'

const COLORES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as ProductoStat
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm shadow-xl">
            <p className="text-white font-medium mb-1">{d.nombre}</p>
            <p className="text-gray-400">Vendidos: <span className="text-white">{d.total_vendido} und</span></p>
            <p className="text-gray-400">Ingresos: <span className="text-red-400">{formatCOP(d.ingresos)}</span></p>
            <p className="text-gray-400">Ganancia: <span className="text-green-400">{formatCOP(d.ganancias)}</span></p>
        </div>
    )
}

interface GraficaProductosProps {
    datos: ProductoStat[]
    titulo: string
    color?: string
}

export function GraficaProductos({ datos, titulo, color }: GraficaProductosProps) {
    if (datos.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{titulo}</h3>
                <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                    Sin datos disponibles
                </div>
            </div>
        )
    }

    const nombreCorto = (nombre: string) =>
        nombre.length > 14 ? nombre.substring(0, 14) + '…' : nombre

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6">{titulo}</h3>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={datos} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                        dataKey="nombre"
                        tickFormatter={nombreCorto}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        angle={-20}
                        textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="total_vendido" name="Unidades vendidas" radius={[6, 6, 0, 0]}>
                        {datos.map((_, i) => (
                            <Cell key={i} fill={color ?? COLORES[i % COLORES.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Tabla con ganancias por producto */}
            <div className="mt-4 border-t border-gray-800 pt-4 space-y-2">
                {datos.map((p, i) => (
                    <div key={p.nombre} className="flex items-center gap-3 text-xs">
                        <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: color ?? COLORES[i % COLORES.length] }}
                        />
                        <span className="text-gray-400 flex-1 truncate">{p.nombre}</span>
                        <span className="text-gray-500">{p.total_vendido} und</span>
                        <span className="text-green-400 w-20 text-right">{formatCOP(p.ganancias)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}