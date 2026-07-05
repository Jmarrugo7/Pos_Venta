import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { fechaHoy, inicioSemana, inicioMes } from '@/lib/utils'

export interface ResumenStats {
    ventasHoy: number
    ventasSemana: number
    ventasMes: number
    gananciaHoy: number
    gananciaSemana: number
    gananciaMes: number
    totalVentas: number
    totalGanancias: number
}

export interface VentaDiaria {
    fecha: string
    ventas: number
    ganancias: number
}

export interface ProductoStat {
    nombre: string
    total_vendido: number
    ingresos: number
    ganancias: number
}

export interface ClienteStat {
    nombre: string
    total_compras: number
    monto_total: number
}

// Calcula ganancias desde filas de ventas con items anidados
function calcGanancias(rows: any[] | null): number {
    if (!rows) return 0
    return rows.reduce((s: number, v: any) => {
        const g = (v.items ?? []).reduce((si: number, item: any) => {
            const costo = item.producto?.costo_compra ?? 0
            return si + (item.precio_unitario - costo) * item.cantidad
        }, 0)
        return s + g
    }, 0)
}

function sumaTotal(rows: any[] | null): number {
    return rows?.reduce((s: number, r: any) => s + (r.total ?? 0), 0) ?? 0
}

// Query reutilizable: ventas con items y costos en un rango de fechas
async function queryVentasConItems(desde: string, hasta: string) {
    const { data } = await supabase
        .from('ventas')
        .select('total, fecha, items:venta_items(cantidad, precio_unitario, producto:productos(nombre, costo_compra))')
        .gte('fecha', desde + 'T00:00:00')
        .lte('fecha', hasta + 'T23:59:59')
    return data ?? []
}

export function useEstadisticas(desde: string, hasta: string) {
    const [resumen, setResumen] = useState<ResumenStats | null>(null)
    const [ventasDiarias, setVentasDiarias] = useState<VentaDiaria[]>([])
    const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoStat[]>([])
    const [productosMenosVendidos, setProductosMenosVendidos] = useState<ProductoStat[]>([])
    const [clientesTop, setClientesTop] = useState<ClienteStat[]>([])
    const [productosAgotados, setProductosAgotados] = useState(0)
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const hoy = fechaHoy()
            const semana = inicioSemana()
            const mes = inicioMes()

            // ── 1. Resumen por periodo (traemos items para calcular ganancias correctamente) ──
            const [vHoy, vSemana, vMes, vTodas] = await Promise.all([
                queryVentasConItems(hoy, hoy),
                queryVentasConItems(semana, hoy),
                queryVentasConItems(mes, hoy),
                queryVentasConItems('2000-01-01', hoy),
            ])

            setResumen({
                ventasHoy: sumaTotal(vHoy),
                ventasSemana: sumaTotal(vSemana),
                ventasMes: sumaTotal(vMes),
                gananciaHoy: calcGanancias(vHoy),
                gananciaSemana: calcGanancias(vSemana),
                gananciaMes: calcGanancias(vMes),
                totalVentas: sumaTotal(vTodas),
                totalGanancias: calcGanancias(vTodas),
            })

            // ── 2. Ventas del rango seleccionado para la gráfica ──
            const ventasRango = await queryVentasConItems(desde, hasta)

            // Agrupar por día
            const porDia: Record<string, VentaDiaria> = {}
            ventasRango.forEach((v: any) => {
                const dia = v.fecha.split('T')[0]
                if (!porDia[dia]) porDia[dia] = { fecha: dia, ventas: 0, ganancias: 0 }
                porDia[dia].ventas += v.total
                porDia[dia].ganancias += calcGanancias([v])
            })
            setVentasDiarias(
                Object.values(porDia).sort((a, b) => a.fecha.localeCompare(b.fecha))
            )

            // ── 3. Productos más/menos vendidos ──
            // Usamos las ventas del rango y sus items (ya los tenemos en ventasRango)
            const porProducto: Record<string, ProductoStat> = {}
            ventasRango.forEach((v: any) => {
                ; (v.items ?? []).forEach((item: any) => {
                    const nombre = item.producto?.nombre ?? 'Desconocido'
                    const costo = item.producto?.costo_compra ?? 0
                    if (!porProducto[nombre]) {
                        porProducto[nombre] = { nombre, total_vendido: 0, ingresos: 0, ganancias: 0 }
                    }
                    porProducto[nombre].total_vendido += item.cantidad
                    porProducto[nombre].ingresos += item.precio_unitario * item.cantidad
                    porProducto[nombre].ganancias += (item.precio_unitario - costo) * item.cantidad
                })
            })

            const prodArr = Object.values(porProducto).sort((a, b) => b.total_vendido - a.total_vendido)
            setProductosMasVendidos(prodArr.slice(0, 8))
            setProductosMenosVendidos([...prodArr].sort((a, b) => a.total_vendido - b.total_vendido).slice(0, 5))

            // ── 4. Clientes top ──
            const { data: ventasCliente } = await supabase
                .from('ventas')
                .select('total, cliente:clientes(nombre)')
                .gte('fecha', desde + 'T00:00:00')
                .lte('fecha', hasta + 'T23:59:59')
                .not('cliente_id', 'is', null)

            const porCliente: Record<string, ClienteStat> = {}
                ; (ventasCliente ?? []).forEach((v: any) => {
                    const nombre = v.cliente?.nombre ?? 'Desconocido'
                    if (!porCliente[nombre]) porCliente[nombre] = { nombre, total_compras: 0, monto_total: 0 }
                    porCliente[nombre].total_compras += 1
                    porCliente[nombre].monto_total += v.total
                })
            setClientesTop(
                Object.values(porCliente).sort((a, b) => b.monto_total - a.monto_total).slice(0, 5)
            )

            // ── 5. Productos agotados ──
            const { count } = await supabase
                .from('productos')
                .select('id', { count: 'exact' })
                .eq('cantidad', 0)
                .eq('activo', true)
            setProductosAgotados(count ?? 0)

        } finally {
            setLoading(false)
        }
    }, [desde, hasta])

    useEffect(() => { cargar() }, [cargar])

    return {
        resumen, ventasDiarias, productosMasVendidos,
        productosMenosVendidos, clientesTop, productosAgotados, loading, cargar,
    }
}