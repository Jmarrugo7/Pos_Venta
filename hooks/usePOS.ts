'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Producto, Cliente, CartItem, TipoVenta } from '@/types'
import { crearVentaAPI } from '@/lib/api'
import { getProductos, getClientes } from '@/lib/db'

export function usePOS() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [clienteId, setClienteId] = useState<string | null>(null)
    const [tipoVenta, setTipoVenta] = useState<TipoVenta>('contado')
    const [loading, setLoading] = useState(true)
    const [procesando, setProcesando] = useState(false)

    // Carga inicial de catálogos activos
    const cargarCatalogos = useCallback(async () => {
        setLoading(true)
        try {
            const [prodRes, cliRes] = await Promise.all([
                getProductos(true), // soloActivos = true
                getClientes()
            ])
            setProductos(prodRes ?? [])
            setClientes(cliRes ?? [])
        } catch (e) {
            console.error('Error cargando catálogos del POS:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargarCatalogos() }, [cargarCatalogos])

    // Calcular el gran total acumulado (RF-31)
    const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0)

    // Agregar producto al carrito (RF-29)
    const agregarAlCarrito = (producto: Producto) => {
        setCart(currentCart => {
            const existe = currentCart.find(item => item.producto.id === producto.id)

            if (existe) {
                // Validar que no exceda las existencias reales
                if (existe.cantidad >= producto.cantidad) return currentCart
                return currentCart.map(item =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * producto.precio_venta }
                        : item
                )
            }

            return [...currentCart, { producto, cantidad: 1, subtotal: producto.precio_venta }]
        })
    }

    // Modificar cantidades de forma manual o selectiva (RF-30)
    const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            setCart(current => current.filter(item => item.producto.id !== productoId))
            return
        }

        setCart(current => current.map(item => {
            if (item.producto.id === productoId) {
                // Validar contra stock máximo disponible
                const cantidadValida = Math.min(nuevaCantidad, item.producto.cantidad)
                return {
                    ...item,
                    cantidad: cantidadValida,
                    subtotal: cantidadValida * item.producto.precio_venta
                }
            }
            return item
        }))
    }

    // Procesar y enviar la orden de venta
    const finalizarVenta = async () => {
        if (cart.length === 0) throw new Error('El carrito de compras está vacío')
        if (tipoVenta === 'credito' && !clienteId) {
            throw new Error('Las ventas a crédito requieren asociar un cliente obligatoriamente')
        }

        setProcesando(true)
        try {
            const { venta } = await crearVentaAPI(cart, tipoVenta, clienteId || undefined)

            // Limpiar el estado del POS tras un checkout exitoso
            setCart([])
            setClienteId(null)
            setTipoVenta('contado')
            await cargarCatalogos()

            return venta.numero_factura
        } catch (e) {
            console.error('Error detallado en finalizarVenta:', e)
            throw e
        } finally {
            setProcesando(false)
        }
    }

    return {
        productos,
        clientes,
        cart,
        clienteId,
        tipoVenta,
        totalVenta,
        loading,
        procesando,
        setClienteId,
        setTipoVenta,
        agregarAlCarrito,
        actualizarCantidad,
        finalizarVenta
    }
}