'use client'

import { Button } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import type { CartItem, Cliente, TipoVenta } from '@/types'

interface CarritoProps {
  cart: CartItem[]
  clientes: Cliente[]
  clienteId: string
  tipo: TipoVenta
  procesando: boolean
  onCambiarCantidad: (productoId: string, cantidad: number) => void
  onClienteChange: (id: string) => void
  onTipoChange: (tipo: TipoVenta) => void
  onProcesar: () => void
}

export function Carrito({
  cart, clientes, clienteId, tipo, procesando,
  onCambiarCantidad, onClienteChange, onTipoChange, onProcesar,
}: CarritoProps) {
  const total = cart.reduce((s, i) => s + i.subtotal, 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-fit sticky top-6">
      <h2 className="text-white font-bold mb-4">
        Carrito {cart.length > 0 && <span className="text-red-400">({cart.length})</span>}
      </h2>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-8">
          Selecciona productos del catálogo
        </p>
      ) : (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {cart.map(item => (
            <div key={item.producto.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{item.producto.nombre}</p>
                <p className="text-gray-500 text-xs">{formatCOP(item.producto.precio_venta)} c/u</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onCambiarCantidad(item.producto.id, item.cantidad - 1)}
                  className="w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition"
                >−</button>
                <span className="text-white text-sm w-6 text-center">{item.cantidad}</span>
                <button
                  onClick={() => onCambiarCantidad(item.producto.id, item.cantidad + 1)}
                  className="w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition"
                >+</button>
              </div>
              <span className="text-gray-400 text-xs w-20 text-right shrink-0">
                {formatCOP(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-800 pt-4 space-y-3">
        {/* Cliente */}
        <select
          value={clienteId}
          onChange={e => onClienteChange(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
        >
          <option value="">Sin cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* Tipo de venta */}
        <div className="flex gap-2">
          {(['contado', 'credito'] as TipoVenta[]).map(t => (
            <button
              key={t}
              onClick={() => onTipoChange(t)}
              className={`flex-1 py-2 rounded-lg text-sm capitalize transition ${
                tipo === t ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400 text-sm">Total</span>
          <span className="text-white font-bold text-xl">{formatCOP(total)}</span>
        </div>

        <Button
          onClick={onProcesar}
          disabled={cart.length === 0 || procesando}
          size="lg"
          className="w-full"
        >
          {procesando ? 'Procesando...' : 'Registrar venta'}
        </Button>
      </div>
    </div>
  )
}