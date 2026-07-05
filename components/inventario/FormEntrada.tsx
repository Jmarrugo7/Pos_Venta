'use client'

import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types'

interface FormEntradaProps {
    abierto: boolean
    onGuardar: (productoId: string, cantidad: number, descripcion: string) => Promise<void>
    onCerrar: () => void
}

export function FormEntrada({ abierto, onGuardar, onCerrar }: FormEntradaProps) {
    const [productos, setProductos] = useState<Producto[]>([])
    const [productoId, setProductoId] = useState('')
    const [cantidad, setCantidad] = useState(1)
    const [descripcion, setDescripcion] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        supabase.from('productos').select('*').eq('activo', true).order('nombre')
            .then(({ data }) => setProductos(data ?? []))
    }, [])

    useEffect(() => {
        if (!abierto) {
            setProductoId('')
            setCantidad(1)
            setDescripcion('')
            setError('')
        }
    }, [abierto])

    const productoSeleccionado = productos.find(p => p.id === productoId)

    async function handleGuardar() {
        if (!productoId) return setError('Selecciona un producto')
        if (cantidad <= 0) return setError('La cantidad debe ser mayor a 0')

        setGuardando(true)
        setError('')
        try {
            await onGuardar(productoId, cantidad, descripcion || 'Entrada de mercancía')
            onCerrar()
        } catch (e) {
            setError((e as Error).message || 'Error al registrar')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Modal abierto={abierto} onCerrar={onCerrar} titulo="Registrar entrada de mercancía">
            <div className="space-y-4">
                {/* Selector de producto */}
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
                                {p.nombre} — Stock actual: {p.cantidad}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Info del producto seleccionado */}
                {productoSeleccionado && (
                    <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm flex justify-between">
                        <span className="text-gray-400">Stock actual</span>
                        <span className={`font-bold ${productoSeleccionado.cantidad === 0 ? 'text-red-400' :
                                productoSeleccionado.cantidad <= productoSeleccionado.cantidad_minima ? 'text-yellow-400' :
                                    'text-white'
                            }`}>
                            {productoSeleccionado.cantidad} unidades
                        </span>
                    </div>
                )}

                <Input
                    label="Cantidad a ingresar"
                    type="number"
                    min={1}
                    value={cantidad}
                    onChange={e => setCantidad(Number(e.target.value))}
                    placeholder="0"
                />

                {/* Preview nuevo stock */}
                {productoSeleccionado && cantidad > 0 && (
                    <div className="bg-green-950 border border-green-900 rounded-lg px-4 py-3 text-sm flex justify-between">
                        <span className="text-gray-400">Stock después de entrada</span>
                        <span className="text-green-400 font-bold">
                            {productoSeleccionado.cantidad + cantidad} unidades
                        </span>
                    </div>
                )}

                <Input
                    label="Descripción (opcional)"
                    type="text"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Ej: Compra proveedor, reposición..."
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
                    {guardando ? 'Registrando...' : 'Registrar entrada'}
                </Button>
            </div>
        </Modal>
    )
}