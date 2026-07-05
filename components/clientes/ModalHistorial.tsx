'use client'

import { useEffect, useState } from 'react'
import { Modal, LoadingRows, EmptyState, Badge } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { formatCOP } from '@/lib/utils'
import type { Cliente, Venta } from '@/types'

interface ModalHistorialProps {
    cliente: Cliente | null
    onCerrar: () => void
}

export function ModalHistorial({ cliente, onCerrar }: ModalHistorialProps) {
    const [ventas, setVentas] = useState<Venta[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!cliente) return

        async function cargarHistorial() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('ventas')
                    .select('*')
                    .eq('cliente_id', cliente.id)
                    .order('fecha', { ascending: false })

                if (error) throw error
                setVentas(data ?? [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        cargarHistorial()
    }, [cliente]) // El arreglo de dependencias ahora cierra correctamente el useEffect

    return (
        <Modal abierto={!!cliente} onCerrar={onCerrar} titulo={`Historial de compras — ${cliente?.nombre}`}>
            <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800 text-left">
                            <th className="pb-2 font-medium">Factura</th>
                            <th className="pb-2 font-medium">Fecha</th>
                            <th className="pb-2 font-medium">Tipo</th>
                            <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    {loading ? (
                        <LoadingRows cols={4} />
                    ) : ventas.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={4}>
                                    <EmptyState mensaje="Este cliente no registra compras aún" icono="🛍️" />
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody className="divide-y divide-gray-800">
                            {ventas.map(v => (
                                <tr key={v.id} className="text-gray-300">
                                    <td className="py-3 text-white font-medium">#{v.numero_factura}</td>
                                    <td className="py-3 text-gray-500 text-xs">
                                        {new Date(v.fecha).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="py-3">
                                        <Badge color={v.tipo === 'credito' ? 'yellow' : 'green'}>
                                            {v.tipo.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-3 text-right font-bold text-white">
                                        {formatCOP(v.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        </Modal>
    )
}