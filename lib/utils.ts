// ─── Formato de moneda ────────────────────────────────────────────────────────
export function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor)
}

// ─── Formato de fechas ────────────────────────────────────────────────────────
export function formatFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

export function fechaHoy(): string {
  return new Date().toISOString().split('T')[0]
}

export function inicioSemana(): string {
  const hoy = new Date()
  const dia = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1))
  return lunes.toISOString().split('T')[0]
}

export function inicioMes(): string {
  const hoy = new Date()
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
}

// ─── Ganancia unitaria ────────────────────────────────────────────────────────
export function calcularGanancia(precioVenta: number, costoCompra: number): number {
  return precioVenta - costoCompra
}

export function calcularMargen(precioVenta: number, costoCompra: number): number {
  if (precioVenta === 0) return 0
  return ((precioVenta - costoCompra) / precioVenta) * 100
}

// ─── Número de factura ────────────────────────────────────────────────────────
export function formatNumeroFactura(numero: number): string {
  return `#${String(numero).padStart(5, '0')}`
}

// ─── Colores de estado de stock ───────────────────────────────────────────────
export function colorStock(cantidad: number, minimo: number): 'green' | 'yellow' | 'red' {
  if (cantidad === 0) return 'red'
  if (cantidad <= minimo) return 'yellow'
  return 'green'
}