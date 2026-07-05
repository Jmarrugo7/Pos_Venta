import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getMovimientos, registrarEntradaMercancia, ajustarInventario } from '@/lib/db'
import type { MovimientoInventario, Producto } from '@/types'

export function useInventario() {
    const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
    const [productosStockBajo, setProductosStockBajo] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const [movs, stockBajo] = await Promise.all([
                getMovimientos(100),
                supabase
                    .from('productos')
                    .select('*')
                    .lte('cantidad', supabase.rpc as never)
                    .then(() =>
                        // Query real: productos donde cantidad <= cantidad_minima
                        supabase.rpc('productos_stock_bajo').then(r => r.data ?? [])
                    ),
            ])
            setMovimientos(movs)
            // Fallback directo si RPC no existe aún
            const { data: sb } = await supabase
                .from('productos')
                .select('*')
                .filter('activo', 'eq', true)
            const bajos = (sb ?? []).filter((p: Producto) => p.cantidad <= p.cantidad_minima)
            setProductosStockBajo(bajos)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    async function registrarEntrada(productoId: string, cantidad: number, descripcion: string) {
        await registrarEntradaMercancia(productoId, cantidad, descripcion)
        await cargar()
    }

    async function ajustar(productoId: string, nuevaCantidad: number, motivo: string) {
        await ajustarInventario(productoId, nuevaCantidad, motivo)
        await cargar()
    }

    return { movimientos, productosStockBajo, loading, cargar, registrarEntrada, ajustar }
}