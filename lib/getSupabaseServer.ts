import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para el Servidor.
 * Utiliza la anon_key y el token de autorización del request
 * para que Supabase aplique las reglas RLS correspondientes.
 */
export function getSupabaseServer(token: string) {
    if (!token) {
        throw new Error('Token de autorización no proporcionado al cliente Supabase')
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        }
    )
}
