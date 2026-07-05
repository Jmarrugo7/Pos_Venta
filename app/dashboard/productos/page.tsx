'use client'

import { useState } from 'react'
import { useProductos } from '@/hooks/useProductos'
import { TablaProductos } from '@/components/productos/TablaProductos'
import { FormProducto } from '@/components/productos/FormProducto'
import { PageHeader, Input, Button, ModalConfirmar } from '@/components/ui'
import type { Producto, ProductoInsert } from '@/types'

export default function ProductosPage() {
    const {
        productos, loading, cargar, crear, actualizar,
        pendienteEliminar, solicitarEliminar, confirmarEliminar, cancelarEliminar,
    } = useProductos()

    const [busqueda, setBusqueda] = useState('')
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Producto | null>(null)

    function abrirCrear() {
        setEditando(null)
        setModalAbierto(true)
    }

    function abrirEditar(p: Producto) {
        setEditando(p)
        setModalAbierto(true)
    }

    function cerrarModal() {
        setModalAbierto(false)
        setEditando(null)
    }

    async function guardar(data: ProductoInsert) {
        if (editando) {
            await actualizar(editando.id, data)
        } else {
            await crear(data)
        }
        cerrarModal()
    }

    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
    )

    const agotados = productos.filter(p => p.cantidad === 0).length
    const stockBajo = productos.filter(p => p.cantidad > 0 && p.cantidad <= p.cantidad_minima).length

    return (
        <div>
            <PageHeader
                titulo="Productos"
                subtitulo={`${productos.length} productos registrados`}
                accion={<Button onClick={abrirCrear}>+ Nuevo producto</Button>}
            />

            {/* Alertas de stock */}
            {(agotados > 0 || stockBajo > 0) && (
                <div className="flex gap-3 mb-6 flex-wrap">
                    {agotados > 0 && (
                        <div className="bg-red-950 border border-red-900 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                            <span>🔴</span>
                            <span className="text-red-400">
                                <span className="font-bold">{agotados}</span> producto{agotados > 1 ? 's' : ''} agotado{agotados > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                    {stockBajo > 0 && (
                        <div className="bg-yellow-950 border border-yellow-900 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            <span className="text-yellow-400">
                                <span className="font-bold">{stockBajo}</span> con stock bajo
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Búsqueda */}
            <div className="flex gap-3 mb-6">
                <Input
                    placeholder="Buscar por nombre o categoría..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="max-w-sm"
                />
                {busqueda && (
                    <button
                        onClick={() => setBusqueda('')}
                        className="text-gray-500 hover:text-white text-sm transition"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {busqueda && (
                <p className="text-gray-600 text-sm mb-4">
                    {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} para "{busqueda}"
                </p>
            )}

            <TablaProductos
                productos={filtrados}
                loading={loading}
                onEditar={abrirEditar}
                onEliminar={solicitarEliminar}
                onRefresh={cargar}
            />

            <FormProducto
                abierto={modalAbierto}
                editando={editando}
                onGuardar={guardar}
                onCerrar={cerrarModal}
            />

            {/* Modal de confirmación para eliminar */}
            <ModalConfirmar
                abierto={!!pendienteEliminar}
                titulo="Eliminar producto"
                descripcion={`¿Estás seguro de que deseas eliminar "${pendienteEliminar?.nombre}"? Esta acción no se puede deshacer.`}
                labelConfirmar="Sí, eliminar"
                labelCancelar="Cancelar"
                peligroso
                onConfirmar={confirmarEliminar}
                onCancelar={cancelarEliminar}
            />
        </div>
    )
}