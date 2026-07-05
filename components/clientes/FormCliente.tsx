'use client'

import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import type { Cliente } from '@/types'

interface FormClienteProps {
    abierto: boolean
    clienteEdicion?: Cliente | null
    onGuardar: (nombre: string, saldo: number) => Promise<void>
    onCerrar: () => void
}

export function FormCliente({ abierto, clienteEdicion, onGuardar, onCerrar }: FormClienteProps) {
    const [nombre, setNombre] = useState('')
    const [saldo, setSaldo] = useState(0)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (clienteEdicion) {
            setNombre(clienteEdicion.nombre)
            setSaldo(clienteEdicion.saldo_pendiente)
        } else {
            setNombre('')
            setSaldo(0)
        }
        setError('')
    }, [clienteEdicion, abierto])

    async function handleGuardar() {
        if (!nombre.trim()) return setError('El nombre completo es obligatorio')
        if (saldo < 0) return setError('El saldo pendiente no puede ser negativo')

        setGuardando(true)
        setError('')
        try {
            await onGuardar(nombre, saldo)
            onCerrar()
        } catch (e) {
            setError((e as Error).message || 'Error al guardar el cliente')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Modal
            abierto={abierto}
            onCerrar={onCerrar}
            titulo={clienteEdicion ? 'Editar información de cliente' : 'Registrar nuevo cliente'}
        >
            <div className="space-y-4">
                <Input
                    label="Nombre completo"
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: Juan Marrugo"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleGuardar()}
                />

                <Input
                    label="Saldo pendiente inicial"
                    type="number"
                    min={0}
                    value={saldo === 0 ? '' : String(saldo)}
                    onChange={e => setSaldo(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="0"
                />

                {error && (
                    <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1" onClick={onCerrar} disabled={guardando}>
                    Cancelar
                </Button>
                <Button className="flex-1" onClick={handleGuardar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Confirmar'}
                </Button>
            </div>
        </Modal>
    )
}