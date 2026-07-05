'use client'

import { useState } from 'react'
import { useClientes } from '@/hooks/useClientes'
import { TablaClientes } from '@/components/clientes/TablaClientes'
import { FormCliente } from '@/components/clientes/FormCliente'
import { ModalHistorial } from '@/components/clientes/ModalHistorial'
import { PageHeader, Button, ModalConfirmar } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import type { Cliente } from '@/types'

function ModalDeudaBloqueo({ cliente, onCerrar }: { cliente: Cliente; onCerrar: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <div className="w-12 h-12 bg-yellow-950 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-white font-bold text-lg text-center mb-2">
                    No se puede eliminar
                </h3>
                <p className="text-gray-400 text-sm text-center mb-2">
                    <span className="text-white font-medium">{cliente.nombre}</span> tiene una deuda pendiente de{' '}
                    <span className="text-red-400 font-bold">{formatCOP(cliente.saldo_pendiente)}</span>.
                </p>
                <p className="text-gray-500 text-xs text-center mb-6">
                    Registra el pago completo de la deuda antes de eliminar este cliente.
                </p>
                <button
                    onClick={onCerrar}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl text-sm transition"
                >
                    Entendido
                </button>
            </div>
        </div>
    )
}

export default function ClientesPage() {
    const { clientes, loading, registrarCliente, editarCliente, eliminarCliente } = useClientes()
    const [busqueda, setBusqueda] = useState('')

    const [modalAbierto, setModalAbierto] = useState(false)
    const [clienteEdicion, setClienteEdicion] = useState<Cliente | null>(null)
    const [clienteHistorial, setClienteHistorial] = useState<Cliente | null>(null)
    const [pendienteEliminar, setPendienteEliminar] = useState<Cliente | null>(null)
    const [bloqueado, setBloqueado] = useState<Cliente | null>(null)

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    async function handleGuardarCliente(nombre: string, saldo: number) {
        if (clienteEdicion) {
            await editarCliente(clienteEdicion.id, nombre, saldo)
        } else {
            await registrarCliente(nombre)
        }
    }

    function handleSolicitarEliminar(cliente: Cliente) {
        if (cliente.saldo_pendiente > 0) {
            setBloqueado(cliente)
        } else {
            setPendienteEliminar(cliente)
        }
    }

    async function handleConfirmarEliminar() {
        if (!pendienteEliminar) return
        await eliminarCliente(pendienteEliminar.id)
        setPendienteEliminar(null)
    }

    return (
        <div>
            <PageHeader
                titulo="Clientes"
                subtitulo={`${clientes.length} clientes en el sistema`}
                accion={
                    <Button onClick={() => { setClienteEdicion(null); setModalAbierto(true) }}>
                        + Registrar cliente
                    </Button>
                }
            />

            <div className="mb-6">
                <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="🔍 Buscar cliente por nombre..."
                    className="w-full md:w-80 bg-gray-900 text-white border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                />
            </div>

            <TablaClientes
                clientes={clientesFiltrados}
                loading={loading}
                onVerHistorial={c => setClienteHistorial(c)}
                onEditar={c => { setClienteEdicion(c); setModalAbierto(true) }}
                onEliminar={handleSolicitarEliminar}
            />

            <FormCliente
                abierto={modalAbierto}
                clienteEdicion={clienteEdicion}
                onGuardar={handleGuardarCliente}
                onCerrar={() => setModalAbierto(false)}
            />

            <ModalHistorial
                cliente={clienteHistorial}
                onCerrar={() => setClienteHistorial(null)}
            />

            {/* Modal bloqueado por deuda */}
            {bloqueado && (
                <ModalDeudaBloqueo
                    cliente={bloqueado}
                    onCerrar={() => setBloqueado(null)}
                />
            )}

            {/* Modal confirmación eliminación normal */}
            <ModalConfirmar
                abierto={!!pendienteEliminar}
                titulo="Eliminar cliente"
                descripcion={`¿Estás seguro de que deseas eliminar a "${pendienteEliminar?.nombre}"? Esta acción no se puede deshacer.`}
                labelConfirmar="Sí, eliminar"
                labelCancelar="Cancelar"
                peligroso
                onConfirmar={handleConfirmarEliminar}
                onCancelar={() => setPendienteEliminar(null)}
            />
        </div>
    )
}