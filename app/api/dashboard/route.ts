import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/getSupabaseServer'

function getToken(req: NextRequest) {
    return req.headers.get('Authorization')?.replace('Bearer ', '') || ''
}

export async function GET(req: NextRequest) {
    try {
        const db = getSupabaseServer(getToken(req))

        // Ventas de hoy
        const hoy = new Date().toISOString().split('T')[0]
        const { data: ventasHoyData } = await db
            .from('ventas')
            .select('total')
            .gte('fecha', hoy)
            .neq('estado', 'anulada')

        // Ventas de la semana
        const inicioSemana = new Date()
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
        const { data: ventasSemanaData } = await db
            .from('ventas')
            .select('total')
            .gte('fecha', inicioSemana.toISOString())
            .neq('estado', 'anulada')

        // Ventas del mes
        const inicioMes = new Date()
        inicioMes.setDate(1)
        const { data: ventasMesData } = await db
            .from('ventas')
            .select('total')
            .gte('fecha', inicioMes.toISOString())
            .neq('estado', 'anulada')

        // Productos agotados
        const { count: agotados } = await db
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('cantidad', 0)
            .eq('activo', true)

        // Clientes activos
        const { count: clientes } = await db
            .from('clientes')
            .select('*', { count: 'exact', head: true })

        // Deudas pendientes
        const { data: deudasData } = await db
            .from('clientes')
            .select('saldo_pendiente')
            .gt('saldo_pendiente', 0)

        const stats = {
            ventasHoy: ventasHoyData?.reduce((s, v) => s + (v.total || 0), 0) || 0,
            ventasSemana: ventasSemanaData?.reduce((s, v) => s + (v.total || 0), 0) || 0,
            ventasMes: ventasMesData?.reduce((s, v) => s + (v.total || 0), 0) || 0,
            productosAgotados: agotados || 0,
            clientesActivos: clientes || 0,
            deudasPendientes: deudasData?.reduce((s, c) => s + (c.saldo_pendiente || 0), 0) || 0,
        }

        return NextResponse.json(stats)
    } catch (e) {
        console.error('Error cargando stats del dashboard:', e)
        return NextResponse.json({ error: 'Error cargando estadisticas' }, { status: 500 })
    }
}
