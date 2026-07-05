'use client'

import { useState } from 'react'
import { useDeudas } from '@/hooks/useDeudas'
import { TablaDeudas } from '@/components/deudas/TablaDeudas'
import { ModalAbono } from '@/components/deudas/ModalAbono'
import { PageHeader } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import type { Cliente } from '@/types'

export default function DeudasPage() {
    const { clientes, loading, totalDeuda, cargar, abonar } = useDeudas()
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
    const [modalAbono, setModalAbono] = useState(false)
    const [busqueda, setBusqueda] = useState('')

    function abrirAbono(cliente: Cliente) {
        setClienteSeleccionado(cliente)
        setModalAbono(true)
    }

    async function handleAbonar(clienteId: string, monto: number) {
        await abonar(clienteId, monto)
        // Actualizar cliente seleccionado con nuevo saldo
        const actualizado = clientes.find(c => c.id === clienteId)
        if (actualizado) {
            setClienteSeleccionado({ ...actualizado, saldo_pendiente: actualizado.saldo_pendiente - monto })
        }
    }

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div>
            <PageHeader
                titulo="Deudas"
                subtitulo={`${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} con deuda pendiente`}
            />

            {/* Resumen total */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-1">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Total deuda acumulada</p>
                    <p className="text-red-400 text-3xl font-bold mt-2">{formatCOP(totalDeuda)}</p>
                    <p className="text-gray-600 text-xs mt-1">Entre {clientes.length} clientes</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Deuda alta (+ $50.000)</p>
                    <p className="text-red-400 text-2xl font-bold mt-2">
                        {clientes.filter(c => c.saldo_pendiente > 50000).length}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">Clientes con deuda crítica</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Deuda promedio</p>
                    <p className="text-yellow-400 text-2xl font-bold mt-2">
                        {clientes.length > 0 ? formatCOP(totalDeuda / clientes.length) : '$0'}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">Por cliente</p>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="flex gap-3 mb-6 items-center">
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-2 text-sm max-w-sm w-full focus:outline-none focus:border-red-500"
                />
                {busqueda && (
                    <button onClick={() => setBusqueda('')} className="text-gray-500 hover:text-white text-sm transition">
                        Limpiar
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <TablaDeudas
                    clientes={filtrados}
                    loading={loading}
                    onVerDetalle={abrirAbono}
                    onAbonar={abrirAbono}
                />
            </div>

            {/* Modal abono */}
            <ModalAbono
                abierto={modalAbono}
                cliente={clienteSeleccionado}
                onAbonar={handleAbonar}
                onCerrar={() => { setModalAbono(false); setClienteSeleccionado(null) }}
            />
        </div>
    )
}