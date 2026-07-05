import { useEffect, useState, useCallback } from 'react'
import { getClientesConDeuda, registrarAbono, getAbonosPorCliente } from '@/lib/db'
import type { Cliente, Abono } from '@/types'

export function useDeudas() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getClientesConDeuda()
            setClientes(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    async function abonar(clienteId: string, monto: number) {
        await registrarAbono(clienteId, monto)
        await cargar()
    }

    const totalDeuda = clientes.reduce((s, c) => s + c.saldo_pendiente, 0)

    return { clientes, loading, totalDeuda, cargar, abonar }
}

export function useAbonosCliente(clienteId: string | null) {
    const [abonos, setAbonos] = useState<Abono[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!clienteId) { setAbonos([]); return }
        setLoading(true)
        getAbonosPorCliente(clienteId)
            .then(setAbonos)
            .finally(() => setLoading(false))
    }, [clienteId])

    return { abonos, loading }
}