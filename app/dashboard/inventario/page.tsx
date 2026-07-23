'use client'

import { useState } from 'react'
import { useInventario } from '@/hooks/useInventario'
import { TablaMovimientos } from '@/components/inventario/TablaMovimientos'
import { FormEntrada } from '@/components/inventario/FormEntrada'
import { FormAjuste } from '@/components/inventario/FormAjuste'
import { PageHeader, Button, Badge } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import type { TipoMovimiento } from '@/types'

const FILTROS: { label: string; value: TipoMovimiento | 'todos' }[] = [
    { label: 'Todos', value: 'todos' },
    { label: '↑ Entradas', value: 'entrada' },
    { label: '↓ Salidas', value: 'salida' },
    { label: '⇄ Ajustes', value: 'ajuste' },
]

export default function InventarioPage() {
    const { movimientos, productosStockBajo, loading, registrarEntrada, ajustar } = useInventario()
    const [modalEntrada, setModalEntrada] = useState(false)
    const [modalAjuste, setModalAjuste] = useState(false)
    const [filtro, setFiltro] = useState<TipoMovimiento | 'todos'>('todos')
    const [verStockBajo, setVerStockBajo] = useState(false)

    const movimientosFiltrados = filtro === 'todos'
        ? movimientos
        : movimientos.filter(m => m.tipo === filtro)

    const agotados = productosStockBajo.filter(p => p.cantidad === 0)
    const bajos = productosStockBajo.filter(p => p.cantidad > 0)

    return (
        <div>
            <PageHeader
                titulo="Movimientos"
                subtitulo={`${movimientos.length} movimientos registrados`}
                accion={
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => setModalAjuste(true)} size="sm">
                            ⇄ Ajuste manual
                        </Button>
                        <Button onClick={() => setModalEntrada(true)} size="sm">
                            + Registrar entrada
                        </Button>
                    </div>
                }
            />

            {/* Panel de alertas */}
            {productosStockBajo.length > 0 && (
                <div className="mb-6">
                    <button
                        onClick={() => setVerStockBajo(!verStockBajo)}
                        className="w-full"
                    >
                        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between hover:border-gray-700 transition">
                            <div className="flex items-center gap-4">
                                {agotados.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-400 text-lg">🔴</span>
                                        <span className="text-red-400 text-sm font-medium">
                                            {agotados.length} agotado{agotados.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                                {bajos.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400 text-lg">⚠️</span>
                                        <span className="text-yellow-400 text-sm font-medium">
                                            {bajos.length} con stock bajo
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className="text-gray-600 text-xs">
                                {verStockBajo ? 'Ocultar ▲' : 'Ver productos ▼'}
                            </span>
                        </div>
                    </button>

                    {verStockBajo && (
                        <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            {/* Tarjetas en móvil */}
                            <div className="md:hidden divide-y divide-gray-800">
                                {productosStockBajo.map(p => (
                                    <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-white font-medium text-sm truncate">{p.nombre}</p>
                                            <p className="text-gray-500 text-xs">{p.categoria || '—'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`font-bold text-sm ${p.cantidad === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {p.cantidad}/{p.cantidad_minima}
                                            </span>
                                            <Badge color={p.cantidad === 0 ? 'red' : 'yellow'}>
                                                {p.cantidad === 0 ? 'Agotado' : 'Stock bajo'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Tabla en desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                                            {['Producto', 'Categoría', 'Stock actual', 'Mínimo', 'Estado'].map(h => (
                                                <th key={h} className="px-5 py-3 font-medium">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {productosStockBajo.map(p => (
                                            <tr key={p.id} className="text-gray-300">
                                                <td className="px-5 py-3 text-white font-medium">{p.nombre}</td>
                                                <td className="px-5 py-3 text-gray-500">{p.categoria || '—'}</td>
                                                <td className={`px-5 py-3 font-bold ${p.cantidad === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                    {p.cantidad}
                                                </td>
                                                <td className="px-5 py-3 text-gray-500">{p.cantidad_minima}</td>
                                                <td className="px-5 py-3">
                                                    <Badge color={p.cantidad === 0 ? 'red' : 'yellow'}>
                                                        {p.cantidad === 0 ? 'Agotado' : 'Stock bajo'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total movimientos', valor: movimientos.length, color: 'text-white' },
                    { label: 'Entradas', valor: movimientos.filter(m => m.tipo === 'entrada').length, color: 'text-green-400' },
                    { label: 'Salidas (ventas)', valor: movimientos.filter(m => m.tipo === 'salida').length, color: 'text-red-400' },
                    { label: 'Ajustes', valor: movimientos.filter(m => m.tipo === 'ajuste').length, color: 'text-blue-400' },
                ].map(item => (
                    <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className={`text-2xl font-bold ${item.color}`}>{item.valor}</p>
                        <p className="text-gray-500 text-xs mt-1">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {FILTROS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFiltro(f.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filtro === f.value
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
                <span className="text-gray-600 text-xs self-center ml-2">
                    {movimientosFiltrados.length} registro{movimientosFiltrados.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Tabla de movimientos */}
            <TablaMovimientos movimientos={movimientosFiltrados} loading={loading} />

            {/* Modales */}
            <FormEntrada
                abierto={modalEntrada}
                onGuardar={registrarEntrada}
                onCerrar={() => setModalEntrada(false)}
            />
            <FormAjuste
                abierto={modalAjuste}
                onGuardar={ajustar}
                onCerrar={() => setModalAjuste(false)}
            />
        </div>
    )
}