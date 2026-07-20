import { useEffect, useState, useCallback } from 'react'
import type { Cliente } from '@/types'
import { crearClienteAPI, actualizarClienteAPI, eliminarClienteAPI } from '@/lib/api'
import { getClientes } from '@/lib/db'

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            // Traemos los clientes junto con la fecha de su última venta para calcular vigencia
            const data = await getClientes()

            // Mapeamos y calculamos si está activo basado en compras del último mes
            const clientesProcesados = (data ?? []).map((c: any) => {
                const tieneComprasRecientes = c.ventas?.some((v: any) => {
                    const unMesAtras = new Date()
                    unMesAtras.setMonth(unMesAtras.getMonth() - 1)
                    return new Date(v.fecha) >= unMesAtras
                })

                return {
                    id: c.id,
                    nombre: c.nombre,
                    saldo_pendiente: c.saldo_pendiente,
                    created_at: c.created_at,
                    activo: c.ventas?.length === 0 ? true : tieneComprasRecientes
                }
            })

            setClientes(clientesProcesados)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    async function registrarCliente(nombre: string, saldo_pendiente: number = 0) {
        await crearClienteAPI(nombre, saldo_pendiente)
        await cargar()
    }

    async function editarCliente(id: string, nombre: string, saldoPendiente: number) {
        await actualizarClienteAPI(id, nombre, saldoPendiente)
        await cargar()
    }

    async function eliminarCliente(id: string) {
        try {
            await eliminarClienteAPI(id)
            await cargar()
        } catch (e: any) {
            const msg = e?.message ?? 'Error desconocido al eliminar cliente'
            alert(msg)
        }
    }

    return { clientes, loading, cargar, registrarCliente, editarCliente, eliminarCliente }
}