import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/getSupabaseServer'

function getToken(req: NextRequest) {
    return req.headers.get('Authorization')?.replace('Bearer ', '') || ''
}

export async function GET(req: NextRequest) {
    try {
        const db = getSupabaseServer(getToken(req))
        const { data, error } = await db.from('clientes').select('*, ventas(fecha)').order('nombre')
        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error obtener clientes:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('POST /api/clientes body:', body)
        const { nombre, saldo_pendiente } = body
        if (!nombre) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        const saldoNum = typeof saldo_pendiente === 'number' ? saldo_pendiente : Number(saldo_pendiente) || 0;

        const { data, error } = await db
            .from('clientes')
            .insert({ nombre, saldo_pendiente: saldoNum })
            .select()
            .single()

        if (error) throw new Error(error.message)
        return NextResponse.json(data, { status: 201 })
    } catch (e) {
        console.error('Error crear cliente:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, ...updates } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        const { data, error } = await db
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error actualizar cliente:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        const { error } = await db
            .from('clientes')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error('Error eliminar cliente:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}
