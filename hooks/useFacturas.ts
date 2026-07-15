import { useEffect, useState, useCallback } from 'react'
import type { Factura, EstadoFactura } from '@/types/facturas'
import { getVentas } from '@/lib/db'

interface FiltrosFactura {
    busqueda: string
    estado: EstadoFactura | 'todas'
    desde: string
    hasta: string
}

export function useFacturas() {
    const [facturas, setFacturas] = useState<Factura[]>([])
    const [loading, setLoading] = useState(true)
    const [filtros, setFiltros] = useState<FiltrosFactura>({
        busqueda: '',
        estado: 'todas',
        desde: '',
        hasta: '',
    })

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getVentas()
            setFacturas(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    async function anularFactura(id: string, motivo: string) {
        const res = await fetch('/api/ventas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, motivo })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Error al anular la factura')
        }
        await cargar()
    }

    const facturasFiltradas = facturas.filter(f => {
        const busq = filtros.busqueda.toLowerCase()
        const coincideBusqueda =
            !busq ||
            String(f.numero_factura).includes(busq) ||
            f.cliente?.nombre?.toLowerCase().includes(busq) ||
            f.fecha?.split('T')[0].includes(busq)

        const coincideEstado = filtros.estado === 'todas' || f.estado === filtros.estado
        const coincideDesde = !filtros.desde || f.fecha >= filtros.desde
        const coincideHasta = !filtros.hasta || f.fecha <= filtros.hasta + 'T23:59:59'

        return coincideBusqueda && coincideEstado && coincideDesde && coincideHasta
    })

    return { facturas: facturasFiltradas, loading, filtros, setFiltros, cargar, anularFactura }
}