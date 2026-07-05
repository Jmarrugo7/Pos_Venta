import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente } from '@/types'

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            // Traemos los clientes junto con la fecha de su última venta para calcular vigencia
            const { data, error } = await supabase
                .from('clientes')
                .select(`
          *,
          ventas (fecha)
        `)
                .order('nombre')

            if (error) throw error

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

    async function registrarCliente(nombre: string) {
        const { error } = await supabase
            .from('clientes')
            .insert([{ nombre, saldo_pendiente: 0 }])
        if (error) throw error
        await cargar()
    }

    async function editarCliente(id: string, nombre: string, saldoPendiente: number) {
        const { error } = await supabase
            .from('clientes')
            .update({ nombre, saldo_pendiente: saldoPendiente })
            .eq('id', id)
        if (error) throw error
        await cargar()
    }

    async function eliminarCliente(id: string) {
        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id)
            if (error) throw new Error(error.message)
            await cargar()
        } catch (e: any) {
            const msg = e?.message ?? 'Error desconocido al eliminar cliente'
            alert(msg)
        }
    }

    return { clientes, loading, cargar, registrarCliente, editarCliente, eliminarCliente }
}