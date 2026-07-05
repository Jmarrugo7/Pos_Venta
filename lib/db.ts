import { supabase } from './supabase'
import type {
  Producto, ProductoInsert, ProductoUpdate,
  Cliente, ClienteInsert, ClienteUpdate,
  Venta, TipoVenta, CartItem,
  MovimientoInventario, TipoMovimiento,
  Abono,
} from '@/types'

// ═══════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════

export async function getProductos(soloActivos = false) {
  let query = supabase.from('productos').select('*').order('nombre')
  if (soloActivos) query = query.eq('activo', true)
  const { data, error } = await query
  if (error) throw error
  return data as Producto[]
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
  const { data, error } = await supabase
    .from('clientes').select('*').order('nombre')
  if (error) throw error
  return data as Cliente[]
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
  const { data, error } = await supabase
    .from('ventas')
    .select('*, cliente:clientes(*), items:venta_items(*, producto:productos(*))')
    .order('fecha', { ascending: false })
    .limit(limite)
  if (error) throw error
  return data as Venta[]
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
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('*, producto:productos(*)')
    .order('fecha', { ascending: false })
    .limit(limite)
  if (error) throw error
  return data as MovimientoInventario[]
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
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .gt('saldo_pendiente', 0)
    .order('saldo_pendiente', { ascending: false })
  if (error) throw error
  return data as Cliente[]
}

export async function registrarAbono(clienteId: string, monto: number) {
  // Insertar abono
  const { error: abonoError } = await supabase
    .from('abonos').insert({ cliente_id: clienteId, monto })
  if (abonoError) throw abonoError

  // Reducir saldo del cliente
  const { data: cliente } = await supabase
    .from('clientes').select('saldo_pendiente').eq('id', clienteId).single()
  
  const nuevoSaldo = Math.max(0, (cliente?.saldo_pendiente ?? 0) - monto)
  await supabase.from('clientes')
    .update({ saldo_pendiente: nuevoSaldo })
    .eq('id', clienteId)
}

export async function getAbonosPorCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('abonos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data as Abono[]
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