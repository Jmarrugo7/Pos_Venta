'use client'

import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import { fetchConAuth } from '@/lib/db'
import type { Producto } from '@/types'

interface FormAjusteProps {
    abierto: boolean
    onGuardar: (productoId: string, nuevaCantidad: number, motivo: string) => Promise<void>
    onCerrar: () => void
}

export function FormAjuste({ abierto, onGuardar, onCerrar }: FormAjusteProps) {
    const [productos, setProductos] = useState<Producto[]>([])
    const [productoId, setProductoId] = useState('')
    const [nuevaCantidad, setNuevaCantidad] = useState(0)
    const [motivo, setMotivo] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchConAuth('/api/productos?activos=true')
            .then(r => r.ok ? r.json() : [])
            .then(data => setProductos(data ?? []))
            .catch(() => setProductos([]))
    }, [])

    useEffect(() => {
        if (!abierto) {
            setProductoId('')
            setNuevaCantidad(0)
            setMotivo('')
            setError('')
        }
    }, [abierto])

    const productoSeleccionado = productos.find(p => p.id === productoId)

    useEffect(() => {
        if (productoSeleccionado) {
            setNuevaCantidad(productoSeleccionado.cantidad)
        }
    }, [productoSeleccionado])

    const diferencia = productoSeleccionado
        ? nuevaCantidad - productoSeleccionado.cantidad
        : 0

    async function handleGuardar() {
        if (!productoId) return setError('Selecciona un producto')
        if (nuevaCantidad < 0) return setError('La cantidad no puede ser negativa')
        if (!motivo.trim()) return setError('El motivo es obligatorio')
        if (diferencia === 0) return setError('La cantidad es igual al stock actual')

        setGuardando(true)
        setError('')
        try {
            await onGuardar(productoId, nuevaCantidad, motivo)
            onCerrar()
        } catch (e) {
            setError((e as Error).message || 'Error al ajustar')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Modal abierto={abierto} onCerrar={onCerrar} titulo="Ajuste manual de inventario">
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Producto</label>
                    <select
                        value={productoId}
                        onChange={e => setProductoId(e.target.value)}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                    >
                        <option value="">Seleccionar producto...</option>
                        {productos.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nombre} — Stock: {p.cantidad}
                            </option>
                        ))}
                    </select>
                </div>

                {productoSeleccionado && (
                    <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm flex justify-between">
                        <span className="text-gray-400">Stock actual</span>
                        <span className="text-white font-bold">{productoSeleccionado.cantidad} unidades</span>
                    </div>
                )}

                <Input
                    label="Nueva cantidad"
                    type="number"
                    min={0}
                    value={nuevaCantidad}
                    onChange={e => setNuevaCantidad(Number(e.target.value))}
                />

                {/* Preview del cambio */}
                {productoSeleccionado && diferencia !== 0 && (
                    <div className={`rounded-lg px-4 py-3 text-sm flex justify-between ${diferencia > 0
                            ? 'bg-green-950 border border-green-900'
                            : 'bg-red-950 border border-red-900'
                        }`}>
                        <span className="text-gray-400">Diferencia</span>
                        <span className={`font-bold ${diferencia > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {diferencia > 0 ? '+' : ''}{diferencia} unidades
                        </span>
                    </div>
                )}

                <Input
                    label="Motivo del ajuste"
                    type="text"
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Ej: Conteo físico, merma, daño..."
                />

                {error && (
                    <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1" onClick={onCerrar} disabled={guardando}>
                    Cancelar
                </Button>
                <Button className="flex-1" onClick={handleGuardar} disabled={guardando}>
                    {guardando ? 'Ajustando...' : 'Aplicar ajuste'}
                </Button>
            </div>
        </Modal>
    )
}