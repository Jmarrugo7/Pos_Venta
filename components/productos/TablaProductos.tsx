'use client'

import { toggleProducto } from '@/lib/db'
import { formatCOP, calcularGanancia } from '@/lib/utils'
import { Badge, LoadingRows, EmptyState } from '@/components/ui'
import type { Producto } from '@/types'

interface TablaProductosProps {
  productos: Producto[]
  loading: boolean
  onEditar: (producto: Producto) => void
  onEliminar: (producto: Producto) => void
  onRefresh: () => void
}

export function TablaProductos({
  productos, loading, onEditar, onEliminar, onRefresh,
}: TablaProductosProps) {
  function celdaStock(p: Producto) {
    if (p.cantidad === 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold">0</span>
          <Badge color="red">Agotado</Badge>
        </div>
      )
    }
    if (p.cantidad <= p.cantidad_minima) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">{p.cantidad}</span>
          <Badge color="yellow">Stock bajo ⚠</Badge>
        </div>
      )
    }
    return <span className="text-white font-medium">{p.cantidad}</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800 text-left">
            {['Producto', 'Categoría', 'Precio venta', 'Costo', 'Ganancia', 'Stock', 'Estado', 'Acciones'].map(h => (
              <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>

        {loading ? (
          <LoadingRows cols={8} />
        ) : productos.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={8}>
                <EmptyState mensaje="No hay productos registrados" icono="📦" />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-gray-800">
            {productos.map(p => (
              <tr key={p.id} className="text-gray-300">
                <td className="py-3 pr-4 font-medium text-white whitespace-nowrap">{p.nombre}</td>
                <td className="py-3 pr-4 text-gray-500">{p.categoria || '—'}</td>
                <td className="py-3 pr-4 whitespace-nowrap">{formatCOP(p.precio_venta)}</td>
                <td className="py-3 pr-4 whitespace-nowrap">{formatCOP(p.costo_compra)}</td>
                <td className="py-3 pr-4 text-green-400 whitespace-nowrap">
                  {formatCOP(calcularGanancia(p.precio_venta, p.costo_compra))}
                </td>
                <td className="py-3 pr-6">{celdaStock(p)}</td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toggleProducto(p.id, !p.activo).then(onRefresh)}
                    className="focus:outline-none"
                  >
                    <Badge color={p.activo ? 'green' : 'gray'}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </button>
                </td>
                <td className="py-3 flex gap-3">
                  <button
                    onClick={() => onEditar(p)}
                    className="text-blue-400 hover:text-blue-300 text-xs transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onEliminar(p)}
                    className="text-red-400 hover:text-red-300 text-xs transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  )
}