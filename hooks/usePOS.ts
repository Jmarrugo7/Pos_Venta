'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Producto, Cliente, CartItem, TipoVenta } from '@/types'

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
                supabase.from('productos').select('*').eq('activo', true).gt('cantidad', 0).order('nombre'),
                supabase.from('clientes').select('*').order('nombre')
            ])
            setProductos(prodRes.data ?? [])
            setClientes(cliRes.data ?? [])
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
            // 1. Insertar la Cabecera de la Venta
            const { data: ventaData, error: ventaError } = await supabase
                .from('ventas')
                .insert([{
                    cliente_id: clienteId || null,
                    total: totalVenta,
                    tipo: tipoVenta,
                    fecha: new Date().toISOString()
                }])
                .select()
                .single()

            if (ventaError) throw ventaError

            // Mapeamos el carrito completo para hacer un Insert Masivo (Batch)
            const itemsParaInsertar = cart.map(item => ({
                venta_id: ventaData.id,
                producto_id: item.producto.id,
                cantidad: item.cantidad,
                precio_unitario: item.producto.precio_venta
            }))

            // 🔍 CONTROL DE DEPURACIÓN: Abre la consola del navegador (F12) y revisa qué IDs viajan aquí
            console.log('DATOS ENVIADOS A VENTAS_ITEMS:', itemsParaInsertar)

            // 2. Insertar todos los ítems de una sola vez
            const { error: itemsError } = await supabase
                .from('venta_items')
                .insert(itemsParaInsertar)

            if (itemsError) throw itemsError // <-- Aquí saltaba tu error antiguo

            // 3. Si los ítems se guardaron bien, actualizamos existencias y generamos movimientos
            for (const item of cart) {
                const nuevoStock = item.producto.cantidad - item.cantidad

                // Actualizar stock del producto
                await supabase
                    .from('productos')
                    .update({ cantidad: nuevoStock })
                    .eq('id', item.producto.id)

                // Registrar movimiento de salida
                await supabase
                    .from('movimientos_inventario')
                    .insert([{
                        producto_id: item.producto.id,
                        tipo: 'salida',
                        cantidad: item.cantidad,
                        descripcion: `Venta POS Factura #${ventaData.numero_factura}`,
                        fecha: new Date().toISOString()
                    }])
            }

            // 4. Si la venta es a Crédito, impactar el saldo del cliente
            if (tipoVenta === 'credito' && clienteId) {
                const clienteActual = clientes.find(c => c.id === clienteId)
                const nuevoSaldo = (clienteActual?.saldo_pendiente || 0) + totalVenta

                await supabase
                    .from('clientes')
                    .update({ saldo_pendiente: nuevoSaldo })
                    .eq('id', clienteId)
            }

            // Limpiar el estado del POS tras un checkout exitoso
            setCart([])
            setClienteId(null)
            setTipoVenta('contado')
            await cargarCatalogos()

            return ventaData.numero_factura
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