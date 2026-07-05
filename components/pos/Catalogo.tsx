'use client'

import { Input } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import type { Producto } from '@/types'

interface CatalogoProps {
  productos: Producto[]
  busqueda: string
  onBusqueda: (v: string) => void
  onAgregar: (producto: Producto) => void
}

export function Catalogo({ productos, busqueda, onBusqueda, onAgregar }: CatalogoProps) {
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <Input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={e => onBusqueda(e.target.value)}
        className="mb-4"
      />

      {filtrados.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-12">Sin resultados</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtrados.map(p => {
            const agotado = p.cantidad === 0
            return (
              <button
                key={p.id}
                onClick={() => !agotado && onAgregar(p)}
                disabled={agotado}
                className={`bg-gray-900 border rounded-xl p-4 text-left transition ${
                  agotado
                    ? 'border-gray-800 opacity-40 cursor-not-allowed'
                    : 'border-gray-800 hover:border-red-600 hover:bg-gray-800'
                }`}
              >
                <p className="text-white font-medium text-sm">{p.nombre}</p>
                <p className="text-red-400 font-bold mt-1 text-sm">{formatCOP(p.precio_venta)}</p>
                <p className={`text-xs mt-1 ${
                  agotado ? 'text-red-500' :
                  p.cantidad <= p.cantidad_minima ? 'text-yellow-500' : 'text-gray-600'
                }`}>
                  {agotado ? 'Agotado' : `Stock: ${p.cantidad}`}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}