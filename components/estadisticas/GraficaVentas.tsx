'use client'

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCOP } from '@/lib/utils'
import type { VentaDiaria } from '@/hooks/useEstadisticas'

function formatEje(valor: number) {
    if (valor >= 1000000) return `$${(valor / 1000000).toFixed(1)}M`
    if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}K`
    return `$${valor}`
}

function formatFechaCorta(fecha: string) {
    const [, mes, dia] = fecha.split('-')
    return `${dia}/${mes}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm shadow-xl">
            <p className="text-gray-400 mb-2">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
                    {p.name}: {formatCOP(p.value)}
                </p>
            ))}
        </div>
    )
}

interface GraficaVentasProps {
    datos: VentaDiaria[]
}

export function GraficaVentas({ datos }: GraficaVentasProps) {
    if (datos.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Ventas y ganancias</h3>
                <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                    Sin datos en el período seleccionado
                </div>
            </div>
        )
    }

    const dataFormateada = datos.map(d => ({
        ...d,
        fecha: formatFechaCorta(d.fecha),
    }))

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6">Ventas y ganancias por día</h3>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dataFormateada} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatEje} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => <span className="text-gray-400 text-xs capitalize">{value}</span>}
                    />
                    <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#ef4444" strokeWidth={2} fill="url(#colorVentas)" />
                    <Area type="monotone" dataKey="ganancias" name="Ganancias" stroke="#22c55e" strokeWidth={2} fill="url(#colorGanancias)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}