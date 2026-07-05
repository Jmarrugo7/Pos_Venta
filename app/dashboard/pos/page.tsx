'use client'

import { useState } from 'react'
import { usePOS } from '@/hooks/usePOS'
import { PageHeader, Button, Badge } from '@/components/ui'
import { formatCOP } from '@/lib/utils'

export default function PointOfSalePage() {
    const {
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
    } = usePOS()

    const [busqueda, setBusqueda] = useState('')
    const [notificacion, setNotificacion] = useState<{ texto: string; error: boolean } | null>(null)

    // Filtrado de productos en tiempo real por coincidencia de caracteres
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    )

    async function handleCheckout() {
        try {
            setNotificacion(null)
            const numeroFactura = await finalizarVenta()
            setNotificacion({ texto: `¡Venta registrada con éxito! Factura #${numeroFactura}`, error: false })
            setTimeout(() => setNotificacion(null), 5000)
        } catch (e) {
            setNotificacion({ texto: (e as Error).message || 'Error al procesar el pago', error: true })
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-4">
            <PageHeader titulo="Punto de Venta" subtitulo="Registro ágil de órdenes y facturación inmediata" />

            {notificacion && (
                <div className={`p-4 rounded-xl border text-sm font-medium ${notificacion.error
                    ? 'bg-red-950/60 border-red-900 text-red-400'
                    : 'bg-green-950/60 border-green-900 text-green-400'
                    }`}>
                    {notificacion.texto}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* PANEL IZQUIERDO: Catálogo y Búsqueda de Productos (RF-29) */}
                <div className="lg:col-span-7 bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="🔍 Buscar por nombre de producto o categoría..."
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    {loading ? (
                        <p className="text-gray-500 text-sm text-center py-8 animate-pulse">Cargando inventario disponible...</p>
                    ) : productosFiltrados.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No se encontraron productos disponibles</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
                            {productosFiltrados.map(p => {
                                const enCarrito = cart.find(item => item.producto.id === p.id)?.cantidad || 0
                                const stockDisponible = p.cantidad - enCarrito

                                return (
                                    <button
                                        key={p.id}
                                        disabled={stockDisponible <= 0}
                                        onClick={() => agregarAlCarrito(p)}
                                        className="group bg-gray-900 hover:bg-gray-800/80 border border-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 rounded-xl p-4 text-left transition flex flex-col justify-between space-y-2"
                                    >
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{p.categoria}</span>
                                            <h4 className="text-white font-medium text-sm mt-0.5 group-hover:text-red-400 transition">{p.nombre}</h4>
                                        </div>
                                        <div className="flex justify-between items-end w-full pt-2 border-t border-gray-800/60">
                                            <span className="text-base font-bold text-white">{formatCOP(p.precio_venta)}</span>
                                            <span className={`text-xs ${stockDisponible <= p.cantidad_minima ? 'text-amber-400 font-semibold' : 'text-gray-500'}`}>
                                                {stockDisponible} disp.
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* PANEL DERECHO: Resumen del Carrito y Parámetros de Factura */}
                <div className="lg:col-span-5 bg-gray-950 border border-gray-800 rounded-2xl p-5 space-y-6 flex flex-col justify-between h-full">

                    <div className="space-y-4">
                        <h3 className="text-white font-semibold text-base border-b border-gray-800 pb-2">Resumen de Venta</h3>

                        {/* Listado del Carrito (RF-30) */}
                        <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-12">El carrito de compras está vacío</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.producto.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-white font-medium text-sm truncate">{item.producto.nombre}</h5>
                                            <p className="text-xs text-gray-500">{formatCOP(item.producto.precio_venta)} c/u</p>
                                        </div>

                                        {/* Controles de Modificación de Cantidad (RF-30) */}
                                        <div className="flex items-center bg-gray-950 border border-gray-800 rounded-lg p-1">
                                            <button
                                                onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                                                className="text-gray-400 hover:text-white px-2 py-0.5 font-bold transition"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={e => actualizarCantidad(item.producto.id, Number(e.target.value))}
                                                className="w-10 bg-transparent text-center text-sm font-semibold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                                                className="text-gray-400 hover:text-white px-2 py-0.5 font-bold transition"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <span className="text-sm font-bold text-white min-w-[70px] text-right">
                                            {formatCOP(item.subtotal)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Asociación del Cliente (RF-32, RF-33) */}
                        <div className="space-y-2 pt-2 border-t border-gray-800">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Asociar Cliente</label>
                            <select
                                value={clienteId || ''}
                                onChange={e => setClienteId(e.target.value || null)}
                                className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                            >
                                <option value="">-- Venta sin cliente (Consumidor Final) --</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} (Saldo: {formatCOP(c.saldo_pendiente)})</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Venta / Financiación (RF-34, RF-35) */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Condición de Pago</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTipoVenta('contado')}
                                    className={`py-2 rounded-xl font-medium text-xs border transition ${tipoVenta === 'contado'
                                        ? 'bg-red-600 border-red-500 text-white font-bold'
                                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                                        }`}
                                >
                                    Contado (Efectivo / QR)
                                </button>
                                <button
                                    type="button"
                                    disabled={!clienteId}
                                    onClick={() => setTipoVenta('credito')}
                                    className={`py-2 rounded-xl font-medium text-xs border transition disabled:opacity-30 disabled:pointer-events-none ${tipoVenta === 'credito'
                                        ? 'bg-red-600 border-red-500 text-white font-bold'
                                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                                        }`}
                                >
                                    Venta a Crédito
                                </button>
                            </div>
                            {!clienteId && (
                                <p className="text-[11px] text-gray-500">Selecciona un cliente para habilitar opción a crédito.</p>
                            )}
                        </div>
                    </div>

                    {/* Bloque Final de Caja */}
                    <div className="pt-4 border-t border-gray-800 mt-4 space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-gray-400">Total a Pagar:</span>
                            <span className="text-2xl font-black text-white">{formatCOP(totalVenta)}</span>
                        </div>

                        <Button
                            className="w-full py-3 text-sm font-bold tracking-wide"
                            disabled={cart.length === 0 || procesando}
                            onClick={handleCheckout}
                        >
                            {procesando ? 'Procesando Venta...' : '⚡ Finalizar Transacción'}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}