import { useEffect, useState, useCallback } from 'react'
import {
  getProductos, crearProducto, actualizarProducto, eliminarProducto,
} from '@/lib/db'
import type { Producto, ProductoInsert } from '@/types'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [pendienteEliminar, setPendienteEliminar] = useState<Producto | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProductos()
      setProductos(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  async function crear(data: ProductoInsert) {
    await crearProducto(data)
    await cargar()
  }

  async function actualizar(id: string, data: ProductoInsert) {
    await actualizarProducto(id, data)
    await cargar()
  }

  // En vez de confirm(), guarda el producto a eliminar
  function solicitarEliminar(producto: Producto) {
    setPendienteEliminar(producto)
  }

  async function confirmarEliminar() {
    if (!pendienteEliminar) return
    await eliminarProducto(pendienteEliminar.id)
    setPendienteEliminar(null)
    await cargar()
  }

  function cancelarEliminar() {
    setPendienteEliminar(null)
  }

  return {
    productos, loading, cargar, crear, actualizar,
    pendienteEliminar, solicitarEliminar, confirmarEliminar, cancelarEliminar,
  }
}