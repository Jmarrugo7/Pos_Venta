import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/**
 * Extrae el user_id del JWT del request.
 * Úsalo en todas las API Routes para identificar al usuario.
 */
export async function getUserId(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.replace('Bearer ', '')

    // Verificar el token con Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    return user.id
}