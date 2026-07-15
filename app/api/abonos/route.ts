import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
    try {
        const db = getSupabaseAdmin()
        const { searchParams } = new URL(req.url)
        const clienteId = searchParams.get('clienteId')
        
        let query = db.from('abonos')
            .select('*')
            .order('fecha', { ascending: false })

        if (clienteId) {
            query = query.eq('cliente_id', clienteId)
        }

        const { data, error } = await query
        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error obtener abonos:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { clienteId, monto } = await req.json()
        if (!clienteId || !monto || monto <= 0)
            return NextResponse.json({ error: 'clienteId y monto (> 0) son requeridos' }, { status: 400 })

        const db = getSupabaseAdmin()

        // Insertar abono
        const { error: abonoError } = await db
            .from('abonos')
            .insert({ cliente_id: clienteId, monto })
        if (abonoError) throw new Error(abonoError.message)

        // Reducir saldo del cliente
        const { data: cliente } = await db
            .from('clientes')
            .select('saldo_pendiente')
            .eq('id', clienteId)
            .single()

        const nuevoSaldo = Math.max(0, (cliente?.saldo_pendiente ?? 0) - monto)
        const { error: updateError } = await db
            .from('clientes')
            .update({ saldo_pendiente: nuevoSaldo })
            .eq('id', clienteId)
        if (updateError) throw new Error(updateError.message)

        return NextResponse.json({ ok: true, nuevoSaldo }, { status: 201 })
    } catch (e) {
        console.error('Error registrar abono:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}
