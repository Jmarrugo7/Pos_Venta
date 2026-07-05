// lib/auth.ts
import { supabase } from './supabase'

// Login con email y contraseña (usa el anon key en el cliente)
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Obtener sesión actual
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Obtener usuario actual
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}
