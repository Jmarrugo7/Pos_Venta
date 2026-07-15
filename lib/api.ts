import { supabase } from '@/lib/supabase'

/**
 * Wrapper que agrega el token de autenticación a cada request.
 * El servidor usa este token para identificar al usuario.
 */
async function apiFetch<T>(url: string, options: RequestInit): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Error en el servidor')
    return data
}

// ── Ventas ────────────────────────────────────────────────────
export async function crearVentaAPI(items: any[], tipo: string, clienteId?: string) {
    return apiFetch('/api/ventas', { method: 'POST', body: JSON.stringify({ items, tipo, clienteId }) })
}

// ── Productos ─────────────────────────────────────────────────
export async function crearProductoAPI(producto: any) {
    return apiFetch('/api/productos', { method: 'POST', body: JSON.stringify(producto) })
}

export async function actualizarProductoAPI(id: string, updates: any) {
    return apiFetch('/api/productos', { method: 'PUT', body: JSON.stringify({ id, ...updates }) })
}

export async function eliminarProductoAPI(id: string) {
    return apiFetch('/api/productos', { method: 'DELETE', body: JSON.stringify({ id }) })
}

// ── Clientes ──────────────────────────────────────────────────
export async function crearClienteAPI(nombre: string, saldo_pendiente = 0) {
    return apiFetch('/api/clientes', { method: 'POST', body: JSON.stringify({ nombre, saldo_pendiente }) })
}

export async function actualizarClienteAPI(id: string, nombre?: string, saldo_pendiente?: number) {
    return apiFetch('/api/clientes', { method: 'PUT', body: JSON.stringify({ id, nombre, saldo_pendiente }) })
}

export async function eliminarClienteAPI(id: string) {
    return apiFetch('/api/clientes', { method: 'DELETE', body: JSON.stringify({ id }) })
}

// ── Abonos ────────────────────────────────────────────────────
export async function registrarAbonoAPI(clienteId: string, monto: number) {
    return apiFetch('/api/abonos', { method: 'POST', body: JSON.stringify({ clienteId, monto }) })
}

// ── Inventario ────────────────────────────────────────────────
export async function registrarEntradaAPI(productoId: string, cantidad: number, descripcion?: string) {
    return apiFetch('/api/inventario', { method: 'POST', body: JSON.stringify({ productoId, cantidad, descripcion, tipo: 'entrada' }) })
}

export async function ajustarInventarioAPI(productoId: string, nuevaCantidad: number, descripcion?: string) {
    return apiFetch('/api/inventario', { method: 'POST', body: JSON.stringify({ productoId, cantidad: nuevaCantidad, descripcion, tipo: 'ajuste' }) })
}