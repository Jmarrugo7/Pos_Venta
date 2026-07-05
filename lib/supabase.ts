import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente con service role (solo servidor)
// Se crea bajo demanda para evitar errores en el cliente (browser)
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está disponible. Solo usar en el servidor.')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
