import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/getSupabaseServer'
import type { TipoVenta, CartItem } from '@/types'

function getToken(req: NextRequest) {
    return req.headers.get('Authorization')?.replace('Bearer ', '') || ''
}

export async function GET(req: NextRequest) {
    try {
        const db = getSupabaseServer(getToken(req))
        const { searchParams } = new URL(req.url)
        const clienteId = searchParams.get('clienteId')
        const desde = searchParams.get('desde')
        const hasta = searchParams.get('hasta')
        
        let query = db.from('ventas')
            .select('*, cliente:clientes(*), items:venta_items(*, producto:productos(*))')
            .order('numero_factura', { ascending: false })

        if (clienteId) {
            query = query.eq('cliente_id', clienteId)
        }
        if (desde) {
            query = query.gte('fecha', desde + 'T00:00:00')
        }
        if (hasta) {
            query = query.lte('fecha', hasta + 'T23:59:59')
        }

        const { data, error } = await query
        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error obtener ventas:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}


export async function POST(req: NextRequest) {
    try {
        const { items, tipo, clienteId }: {
            items: CartItem[]
            tipo: TipoVenta
            clienteId?: string
        } = await req.json()

        // ── Validaciones de negocio ──────────────────────────────
        if (!items?.length)
            return NextResponse.json({ error: 'La venta debe tener al menos un producto' }, { status: 400 })

        if (!['contado', 'credito'].includes(tipo))
            return NextResponse.json({ error: 'Tipo de venta inválido' }, { status: 400 })

        if (tipo === 'credito' && !clienteId)
            return NextResponse.json({ error: 'Una venta a crédito requiere un cliente' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        // ── Verificar stock antes de proceder ────────────────────
        for (const item of items) {
            if (item.cantidad <= 0)
                return NextResponse.json({ error: `Cantidad inválida para ${item.producto.nombre}` }, { status: 400 })

            const { data: prod } = await db
                .from('productos')
                .select('cantidad, nombre, activo')
                .eq('id', item.producto.id)
                .single()

            if (!prod || !prod.activo)
                return NextResponse.json({ error: `Producto "${item.producto.nombre}" no disponible` }, { status: 400 })

            if (prod.cantidad < item.cantidad)
                return NextResponse.json({
                    error: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.cantidad}`
                }, { status: 400 })
        }

        // ── Verificar que el cliente existe (si aplica) ──────────
        if (clienteId) {
            const { data: cliente } = await db.from('clientes').select('id').eq('id', clienteId).single()
            if (!cliente)
                return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })
        }

        // ── Calcular total usando precios reales de la DB ────────
        const productosDB = await Promise.all(
            items.map(i => db.from('productos').select('id, precio_venta').eq('id', i.producto.id).single())
        )
        const total = productosDB.reduce((sum, { data: p }, idx) => {
            return sum + (p?.precio_venta ?? 0) * items[idx].cantidad
        }, 0)

        if (total <= 0)
            return NextResponse.json({ error: 'El total de la venta debe ser mayor a 0' }, { status: 400 })

        // ── Crear la venta ───────────────────────────────────────
        const { data: venta, error: ventaError } = await db
            .from('ventas')
            .insert({ cliente_id: clienteId ?? null, total, tipo })
            .select()
            .single()
        if (ventaError) throw new Error(ventaError.message)

        // ── Insertar items con precio real de la DB ──────────────
        const ventaItems = productosDB.map(({ data: p }, idx) => ({
            venta_id: venta.id,
            producto_id: items[idx].producto.id,
            cantidad: items[idx].cantidad,
            precio_unitario: p?.precio_venta ?? 0,
        }))
        const { error: itemsError } = await db.from('venta_items').insert(ventaItems)
        if (itemsError) throw new Error(itemsError.message)

        // ── Descontar inventario y registrar movimientos ─────────
        for (const item of items) {
            const { data: prod, error: prodErr } = await db.from('productos').select('cantidad').eq('id', item.producto.id).single()
            if (prodErr) throw new Error(prodErr.message)

            const { error: updErr } = await db.from('productos')
                .update({ cantidad: (prod?.cantidad ?? 0) - item.cantidad })
                .eq('id', item.producto.id)
            if (updErr) throw new Error(updErr.message)

            const { error: movErr } = await db.from('movimientos_inventario').insert({
                producto_id: item.producto.id,
                tipo: 'salida',
                cantidad: item.cantidad,
                descripcion: `Venta #${venta.numero_factura}`,
            })
            if (movErr) throw new Error(movErr.message)
        }

        // ── Si es crédito, actualizar saldo del cliente ──────────
        if (tipo === 'credito' && clienteId) {
            const { data: cliente, error: cliErr } = await db.from('clientes').select('saldo_pendiente').eq('id', clienteId).single()
            if (cliErr) throw new Error(cliErr.message)

            const { error: cliUpdErr } = await db.from('clientes')
                .update({ saldo_pendiente: (cliente?.saldo_pendiente ?? 0) + total })
                .eq('id', clienteId)
            if (cliUpdErr) throw new Error(cliUpdErr.message)
        }

        return NextResponse.json({ venta }, { status: 201 })
    } catch (e) {
        console.error('Error crear venta:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, motivo } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
        if (!motivo) return NextResponse.json({ error: 'Motivo de anulación requerido' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        // Obtener la venta con sus items
        const { data: venta, error: ventaErr } = await db
            .from('ventas')
            .select('*, items:venta_items(producto_id, cantidad)')
            .eq('id', id)
            .single()

        if (ventaErr || !venta)
            return NextResponse.json({ error: 'La factura no existe o ya fue anulada' }, { status: 404 })

        if (venta.estado === 'anulada')
            return NextResponse.json({ error: 'Esta factura ya fue anulada' }, { status: 400 })

        // Marcar la venta como anulada
        const { error: anularErr } = await db.from('ventas')
            .update({ estado: 'anulada', anulada_en: new Date().toISOString(), motivo_anulacion: motivo })
            .eq('id', id)
        if (anularErr) throw new Error(anularErr.message)

        // Revertir inventario: devolver las cantidades de cada item
        for (const item of (venta.items ?? [])) {
            const { data: prod, error: prodErr } = await db
                .from('productos')
                .select('cantidad')
                .eq('id', item.producto_id)
                .single()
            if (prodErr) throw new Error(prodErr.message)

            const { error: updErr } = await db.from('productos')
                .update({ cantidad: (prod?.cantidad ?? 0) + item.cantidad })
                .eq('id', item.producto_id)
            if (updErr) throw new Error(updErr.message)

            // Registrar movimiento de entrada por anulación
            const { error: movErr } = await db.from('movimientos_inventario').insert({
                producto_id: item.producto_id,
                tipo: 'entrada',
                cantidad: item.cantidad,
                descripcion: `Anulación de venta #${venta.numero_factura}: ${motivo}`,
            })
            if (movErr) throw new Error(movErr.message)
        }

        // Si era venta a crédito, revertir el saldo del cliente
        if (venta.tipo === 'credito' && venta.cliente_id) {
            const { data: cliente, error: cliErr } = await db
                .from('clientes')
                .select('saldo_pendiente')
                .eq('id', venta.cliente_id)
                .single()
            if (cliErr) throw new Error(cliErr.message)

            const nuevoSaldo = Math.max(0, (cliente?.saldo_pendiente ?? 0) - venta.total)
            const { error: cliUpdErr } = await db.from('clientes')
                .update({ saldo_pendiente: nuevoSaldo })
                .eq('id', venta.cliente_id)
            if (cliUpdErr) throw new Error(cliUpdErr.message)
        }

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error('Error anular venta:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}