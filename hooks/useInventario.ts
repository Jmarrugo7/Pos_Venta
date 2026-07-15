import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getMovimientos } from '@/lib/db'
import type { MovimientoInventario, Producto } from '@/types'
import { registrarEntradaAPI, ajustarInventarioAPI } from '@/lib/api'

export function useInventario() {
    const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
    const [productosStockBajo, setProductosStockBajo] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const movs = await getMovimientos(100)
            setMovimientos(movs)

            const res = await fetch('/api/productos?activos=true')
            if (res.ok) {
                const todos = await res.json() as Producto[]
                const bajos = todos.filter(p => p.cantidad <= p.cantidad_minima)
                setProductosStockBajo(bajos)
            }
        } catch (e) {
            console.error('Error cargando inventario', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    async function registrarEntrada(productoId: string, cantidad: number, descripcion: string) {
        await registrarEntradaAPI(productoId, cantidad, descripcion)
        await cargar()
    }

    async function ajustar(productoId: string, nuevaCantidad: number, motivo: string) {
        await ajustarInventarioAPI(productoId, nuevaCantidad, motivo)
        await cargar()
    }

    return { movimientos, productosStockBajo, loading, cargar, registrarEntrada, ajustar }
}