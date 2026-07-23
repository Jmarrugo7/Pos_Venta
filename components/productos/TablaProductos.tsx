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

  if (loading) {
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
          <LoadingRows cols={8} />
        </table>
      </div>
    )
  }

  if (productos.length === 0) {
    return <EmptyState mensaje="No hay productos registrados" icono="📦" />
  }

  return (
    <>
      {/* ── Vista móvil: tarjetas ─────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {productos.map(p => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{p.nombre}</p>
                <p className="text-gray-500 text-xs mt-0.5">{p.categoria || 'Sin categoría'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleProducto(p.id, !p.activo).then(onRefresh)}
                  className="focus:outline-none"
                >
                  <Badge color={p.activo ? 'green' : 'gray'}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-800 rounded-lg px-2 py-1.5">
                <p className="text-gray-500 text-xs">Precio venta</p>
                <p className="text-white text-xs font-medium mt-0.5">{formatCOP(p.precio_venta)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg px-2 py-1.5">
                <p className="text-gray-500 text-xs">Costo</p>
                <p className="text-white text-xs font-medium mt-0.5">{formatCOP(p.costo_compra)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg px-2 py-1.5">
                <p className="text-gray-500 text-xs">Ganancia</p>
                <p className="text-green-400 text-xs font-medium mt-0.5">
                  {formatCOP(calcularGanancia(p.precio_venta, p.costo_compra))}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>{celdaStock(p)}</div>
              <div className="flex gap-3">
                <button
                  onClick={() => onEditar(p)}
                  className="text-blue-400 hover:text-blue-300 text-xs transition font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => onEliminar(p)}
                  className="text-red-400 hover:text-red-300 text-xs transition font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Vista desktop: tabla ──────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800 text-left">
              {['Producto', 'Categoría', 'Precio venta', 'Costo', 'Ganancia', 'Stock', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
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
        </table>
      </div>
    </>
  )
}