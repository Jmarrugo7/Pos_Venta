import { supabase } from './supabase'
import type {
  Producto, ProductoInsert, ProductoUpdate,
  Cliente, ClienteInsert, ClienteUpdate,
  Venta, TipoVenta, CartItem,
  MovimientoInventario, TipoMovimiento,
  Abono,
} from '@/types'

export async function fetchConAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  return fetch(url, {
      ...options,
      headers: {
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
  })
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════

export async function getProductos(soloActivos = false) {
  const url = soloActivos ? '/api/productos?activos=true' : '/api/productos'
  const res = await fetchConAuth(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al cargar productos' }))
    throw new Error(err.error ?? 'Error al cargar productos')
  }
  return (await res.json()) as Producto[]
}

export async function getProductoById(id: string) {
  const { data, error } = await supabase
    .from('productos').select('*').eq('id', id).single()
  if (error) throw error
  return data as Producto
}

export async function buscarProductos(nombre: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .ilike('nombre', `%${nombre}%`)
    .eq('activo', true)
  if (error) throw error
  return data as Producto[]
}

export async function crearProducto(producto: ProductoInsert) {
  const { data, error } = await supabase
    .from('productos').insert(producto).select().single()
  if (error) throw error
  return data as Producto
}

export async function actualizarProducto(id: string, updates: ProductoUpdate) {
  const { data, error } = await supabase
    .from('productos').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Producto
}

export async function eliminarProducto(id: string) {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function toggleProducto(id: string, activo: boolean) {
  return actualizarProducto(id, { activo })
}

export async function getProductosStockBajo() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .filter('cantidad', 'lte', supabase.rpc as never) // usamos RPC abajo
  // Alternativa directa:
  const { data: stockBajo, error: e2 } = await supabase
    .from('productos')
    .select('*')
    .lte('cantidad', supabase.rpc as never)

  // Query real:
  const { data: result, error: err } = await supabase.rpc('productos_stock_bajo')
  if (err) {
    // fallback sin RPC
    const { data: fallback } = await supabase
      .from('productos')
      .select('*')
      .filter('cantidad', 'lte', 'cantidad_minima')
    return fallback as Producto[]
  }
  return result as Producto[]
}

// ═══════════════════════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════════════════════

export async function getClientes() {
  const res = await fetchConAuth('/api/clientes')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al cargar clientes' }))
    throw new Error(err.error ?? 'Error al cargar clientes')
  }
  return (await res.json()) as Cliente[]
}

export async function getClienteById(id: string) {
  const { data, error } = await supabase
    .from('clientes').select('*').eq('id', id).single()
  if (error) throw error
  return data as Cliente
}

export async function buscarClientes(nombre: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .ilike('nombre', `%${nombre}%`)
  if (error) throw error
  return data as Cliente[]
}

export async function crearCliente(cliente: ClienteInsert) {
  const { data, error } = await supabase
    .from('clientes').insert({ ...cliente, saldo_pendiente: 0 }).select().single()
  if (error) throw error
  return data as Cliente
}

export async function actualizarCliente(id: string, updates: ClienteUpdate) {
  const { data, error } = await supabase
    .from('clientes').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Cliente
}

export async function eliminarCliente(id: string) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}

export async function getHistorialCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, items:venta_items(*, producto:productos(*))')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data as Venta[]
}

// ═══════════════════════════════════════════════════════════════
// VENTAS
// ═══════════════════════════════════════════════════════════════

export async function getVentas(limite = 50) {
  const res = await fetchConAuth('/api/ventas')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al cargar ventas' }))
    throw new Error(err.error ?? 'Error al cargar ventas')
  }
  return (await res.json()) as any
}

export async function crearVenta(
  items: CartItem[],
  tipo: TipoVenta,
  clienteId?: string
) {
  // 1. Calcular total
  const total = items.reduce((sum, i) => sum + i.subtotal, 0)

  // 2. Crear la venta
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert({ cliente_id: clienteId ?? null, total, tipo })
    .select()
    .single()
  if (ventaError) throw ventaError

  // 3. Insertar items
  const ventaItems = items.map(i => ({
    venta_id: venta.id,
    producto_id: i.producto.id,
    cantidad: i.cantidad,
    precio_unitario: i.producto.precio_venta,
  }))
  const { error: itemsError } = await supabase.from('venta_items').insert(ventaItems)
  if (itemsError) throw itemsError

  // 4. Descontar inventario y registrar movimientos
  for (const item of items) {
    await supabase.rpc('descontar_inventario', {
      p_producto_id: item.producto.id,
      p_cantidad: item.cantidad,
    })
    await registrarMovimiento(item.producto.id, 'salida', item.cantidad, `Venta #${venta.numero_factura}`)
  }

  // 5. Si es crédito, actualizar saldo del cliente
  if (tipo === 'credito' && clienteId) {
    await supabase.rpc('incrementar_saldo', {
      p_cliente_id: clienteId,
      p_monto: total,
    })
  }

  return venta as Venta
}

// ═══════════════════════════════════════════════════════════════
// INVENTARIO
// ═══════════════════════════════════════════════════════════════

export async function getMovimientos(limite = 100) {
  const res = await fetchConAuth(`/api/inventario?limite=${limite}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al cargar inventario' }))
    throw new Error(err.error ?? 'Error al cargar inventario')
  }
  return (await res.json()) as MovimientoInventario[]
}

export async function registrarMovimiento(
  productoId: string,
  tipo: TipoMovimiento,
  cantidad: number,
  descripcion?: string
) {
  const { error } = await supabase.from('movimientos_inventario').insert({
    producto_id: productoId,
    tipo,
    cantidad,
    descripcion: descripcion ?? null,
  })
  if (error) throw error
}

export async function registrarEntradaMercancia(
  productoId: string,
  cantidad: number,
  descripcion?: string
) {
  // Actualizar cantidad en productos
  const { data: producto } = await supabase
    .from('productos').select('cantidad').eq('id', productoId).single()
  
  await supabase.from('productos')
    .update({ cantidad: (producto?.cantidad ?? 0) + cantidad })
    .eq('id', productoId)

  await registrarMovimiento(productoId, 'entrada', cantidad, descripcion)
}

export async function ajustarInventario(
  productoId: string,
  nuevaCantidad: number,
  motivo: string
) {
  const { data: producto } = await supabase
    .from('productos').select('cantidad').eq('id', productoId).single()
  
  const diferencia = nuevaCantidad - (producto?.cantidad ?? 0)

  await supabase.from('productos')
    .update({ cantidad: nuevaCantidad })
    .eq('id', productoId)

  await registrarMovimiento(
    productoId,
    'ajuste',
    Math.abs(diferencia),
    `Ajuste manual: ${motivo}`
  )
}

// ═══════════════════════════════════════════════════════════════
// DEUDAS Y ABONOS
// ═══════════════════════════════════════════════════════════════

export async function getClientesConDeuda() {
  const res = await fetchConAuth('/api/clientes')
  if (!res.ok) throw new Error('Error al cargar clientes con deuda')
  const data = (await res.json()) as Cliente[]
  return data.filter(c => c.saldo_pendiente !== 0).sort((a, b) => b.saldo_pendiente - a.saldo_pendiente)
}

export async function registrarAbono(clienteId: string, monto: number) {
  const res = await fetchConAuth('/api/abonos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clienteId, monto })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al registrar abono')
  }
}

export async function getAbonosPorCliente(clienteId: string) {
  const res = await fetchConAuth(`/api/abonos?clienteId=${clienteId}`)
  if (!res.ok) throw new Error('Error al cargar abonos del cliente')
  return (await res.json()) as Abono[]
}

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════

export async function getEstadisticasVentas(desde: string, hasta: string) {
  const { data, error } = await supabase
    .from('ventas')
    .select('total, fecha, tipo, items:venta_items(cantidad, precio_unitario, producto:productos(costo_compra))')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha')
  if (error) throw error
  return data
}

export async function getProductosMasVendidos(limite = 10) {
  const { data, error } = await supabase.rpc('productos_mas_vendidos', { limite })
  if (error) {
    // fallback manual
    const { data: items } = await supabase
      .from('venta_items')
      .select('producto_id, cantidad, producto:productos(nombre)')
    return items
  }
  return data
}