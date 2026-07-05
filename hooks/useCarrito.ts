import { useState } from 'react'
import type { Producto, CartItem, TipoVenta } from '@/types'

export function useCarrito() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [clienteId, setClienteId] = useState('')
  const [tipo, setTipo] = useState<TipoVenta>('contado')

  function agregar(producto: Producto) {
    setCart(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) {
        return prev.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.producto.precio_venta }
            : i
        )
      }
      return [...prev, { producto, cantidad: 1, subtotal: producto.precio_venta }]
    })
  }

  function cambiarCantidad(productoId: string, cantidad: number) {
    if (cantidad <= 0) {
      setCart(prev => prev.filter(i => i.producto.id !== productoId))
    } else {
      setCart(prev => prev.map(i =>
        i.producto.id === productoId
          ? { ...i, cantidad, subtotal: cantidad * i.producto.precio_venta }
          : i
      ))
    }
  }

  function limpiar() {
    setCart([])
    setClienteId('')
    setTipo('contado')
  }

  const total = cart.reduce((s, i) => s + i.subtotal, 0)

  return {
    cart, clienteId, tipo, total,
    agregar, cambiarCantidad, limpiar,
    setClienteId, setTipo,
  }
}