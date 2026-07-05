'use client'

import { formatCOP } from '@/lib/utils'
import { EmptyState } from '@/components/ui'
import type { ClienteStat } from '@/hooks/useEstadisticas'

interface TablaClientesTopProps {
    clientes: ClienteStat[]
}

const MEDALLAS = ['🥇', '🥈', '🥉']

export function TablaClientesTop({ clientes }: TablaClientesTopProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6">Clientes con mayores compras</h3>

            {clientes.length === 0 ? (
                <EmptyState mensaje="Sin datos en el período" icono="👥" />
            ) : (
                <div className="space-y-3">
                    {clientes.map((c, i) => {
                        const pct = Math.round((c.monto_total / clientes[0].monto_total) * 100)
                        return (
                            <div key={c.nombre}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{MEDALLAS[i] ?? `${i + 1}.`}</span>
                                        <span className="text-white text-sm font-medium">{c.nombre}</span>
                                        <span className="text-gray-600 text-xs">{c.total_compras} compra{c.total_compras !== 1 ? 's' : ''}</span>
                                    </div>
                                    <span className="text-white font-bold text-sm">{formatCOP(c.monto_total)}</span>
                                </div>
                                <div className="h-1.5 bg-gray-800 rounded-full">
                                    <div
                                        className="h-1.5 bg-red-600 rounded-full transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}