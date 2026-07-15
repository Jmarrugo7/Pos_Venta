import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con service role key.
 * ⚠️ SOLO importar desde:
 *   - app/api/** (API Routes)
 *   - Nunca desde components/, hooks/, o lib/db.ts
 *
 * Bypasea RLS — tiene acceso total a la base de datos.
 */
export function getSupabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY no está disponible. ' +
            'Este cliente solo puede usarse en el servidor (API Routes).'
        )
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}