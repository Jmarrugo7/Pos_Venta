export type EstadoFactura = 'activa' | 'anulada'

export interface Factura {
    id: string
    numero_factura: number
    cliente_id: string | null
    total: number
    tipo: 'contado' | 'credito'
    estado: EstadoFactura
    fecha: string
    anulada_en?: string | null
    motivo_anulacion?: string | null
    cliente?: { nombre: string } | null
    items?: FacturaItem[]
}

export interface FacturaItem {
    id: string
    venta_id: string
    producto_id: string
    cantidad: number
    precio_unitario: number
    producto?: { nombre: string; costo_compra: number } | null
}