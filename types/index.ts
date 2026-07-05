// ─── Producto ───────────────────────────────────────────────────────────────
export interface Producto {
  id: string
  nombre: string
  categoria: string
  precio_venta: number
  costo_compra: number
  cantidad: number
  cantidad_minima: number
  activo: boolean
  created_at: string
}

export type ProductoInsert = Omit<Producto, 'id' | 'created_at'>
export type ProductoUpdate = Partial<ProductoInsert>

// ─── Cliente ─────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string
  nombre: string
  saldo_pendiente: number
  created_at: string
}

export type ClienteInsert = Omit<Cliente, 'id' | 'created_at' | 'saldo_pendiente'>
export type ClienteUpdate = Partial<ClienteInsert>

// ─── Venta ───────────────────────────────────────────────────────────────────
export type TipoVenta = 'contado' | 'credito'

export interface Venta {
  id: string
  numero_factura: number
  cliente_id: string | null
  total: number
  tipo: TipoVenta
  fecha: string
  cliente?: Cliente
  items?: VentaItem[]
}

export interface VentaItem {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  producto?: Producto
}

// Ítem en el carrito del POS (antes de guardar)
export interface CartItem {
  producto: Producto
  cantidad: number
  subtotal: number
}

// ─── Inventario ──────────────────────────────────────────────────────────────
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

export interface MovimientoInventario {
  id: string
  producto_id: string
  tipo: TipoMovimiento
  cantidad: number
  fecha: string
  descripcion: string | null
  producto?: Producto
}

// ─── Deudas / Abonos ─────────────────────────────────────────────────────────
export interface Abono {
  id: string
  cliente_id: string
  monto: number
  fecha: string
  cliente?: Cliente
}

// ─── Estadísticas ────────────────────────────────────────────────────────────
export interface EstadisticasGenerales {
  ventas_hoy: number
  ventas_semana: number
  ventas_mes: number
  ganancias_totales: number
  productos_agotados: number
  deudas_pendientes: number
}

export interface ProductoMasVendido {
  producto_id: string
  nombre: string
  total_vendido: number
  ingresos: number
}