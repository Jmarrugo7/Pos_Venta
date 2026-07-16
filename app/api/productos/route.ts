import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/getSupabaseServer'

function getToken(req: NextRequest) {
    return req.headers.get('Authorization')?.replace('Bearer ', '') || ''
}

export async function GET(req: NextRequest) {
    try {
        const db = getSupabaseServer(getToken(req))
        const { searchParams } = new URL(req.url)
        const soloActivos = searchParams.get('activos') === 'true'

        let query = db.from('productos').select('*').order('nombre')
        if (soloActivos) query = query.eq('activo', true)

        const { data, error } = await query
        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error obtener productos:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const producto = await req.json()
        const db = getSupabaseServer(getToken(req))

        const { data, error } = await db
            .from('productos')
            .insert(producto)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return NextResponse.json(data, { status: 201 })
    } catch (e) {
        console.error('Error crear producto:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, ...updates } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        const { data, error } = await db
            .from('productos')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return NextResponse.json(data)
    } catch (e) {
        console.error('Error actualizar producto:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

        const db = getSupabaseServer(getToken(req))

        const { error } = await db
            .from('productos')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error('Error eliminar producto:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}
