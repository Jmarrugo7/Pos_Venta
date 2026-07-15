import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
    try {
        const db = getSupabaseAdmin()
        const { searchParams } = new URL(req.url)
        const limite = parseInt(searchParams.get('limite') || '100', 10)
        
        const { data, error } = await db.from('movimientos_inventario')
            .select('*, producto:productos(*)')
            .order('fecha', { ascending: false })
            .limit(limite)

        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error obtener inventario:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { productoId, cantidad, descripcion, tipo } = await req.json()
        if (!productoId || !cantidad || cantidad <= 0)
            return NextResponse.json({ error: 'productoId y cantidad (> 0) son requeridos' }, { status: 400 })

        const db = getSupabaseAdmin()

        // Obtener cantidad actual
        const { data: producto } = await db
            .from('productos')
            .select('cantidad')
            .eq('id', productoId)
            .single()

        if (!producto)
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

        if (tipo === 'entrada') {
            // Entrada de mercancía: sumar al stock
            await db.from('productos')
                .update({ cantidad: producto.cantidad + cantidad })
                .eq('id', productoId)

            await db.from('movimientos_inventario').insert({
                producto_id: productoId,
                tipo: 'entrada',
                cantidad,
                descripcion: descripcion ?? null,
            })
        } else if (tipo === 'ajuste') {
            // Ajuste: establecer nueva cantidad
            const diferencia = Math.abs(cantidad - producto.cantidad)

            await db.from('productos')
                .update({ cantidad })
                .eq('id', productoId)

            await db.from('movimientos_inventario').insert({
                producto_id: productoId,
                tipo: 'ajuste',
                cantidad: diferencia,
                descripcion: descripcion ?? 'Ajuste manual',
            })
        } else {
            return NextResponse.json({ error: 'Tipo inválido. Use "entrada" o "ajuste"' }, { status: 400 })
        }

        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (e) {
        console.error('Error inventario:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}
