import { useState, useCallback } from 'react'

export interface Mensaje {
    id: string
    role: 'user' | 'assistant'
    content: string
    ventaCreada?: boolean
    error?: boolean
}

export function useChat() {
    const [mensajes, setMensajes] = useState<Mensaje[]>([
        {
            id: '0',
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de ventas 👋\n\nPuedo ayudarte a:\n- **Registrar ventas** — "véndele 2 Coca-Colas a Juan"\n- **Consultar el negocio** — "¿cuánto vendí hoy?", "¿qué me debe María?"\n- **Revisar inventario** — "¿qué productos están por agotarse?"\n\n¿En qué te ayudo?',
        },
    ])
    const [cargando, setCargando] = useState(false)
    const [ventaReciente, setVentaReciente] = useState(false)

    const enviar = useCallback(async (texto: string) => {
        if (!texto.trim() || cargando) return

        const msgUsuario: Mensaje = {
            id: Date.now().toString(),
            role: 'user',
            content: texto,
        }

        const historial = [...mensajes, msgUsuario]
        setMensajes(historial)
        setCargando(true)

        try {
            const res = await fetch('/api/ia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: historial
                        .filter(m => !m.error)
                        .map(m => ({ role: m.role, content: m.content })),
                }),
            })

            const data = await res.json()

            if (data.error) throw new Error(data.error)

            const msgAsistente: Mensaje = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.texto,
                ventaCreada: data.ventaCreada,
            }

            setMensajes(prev => [...prev, msgAsistente])

            if (data.ventaCreada) {
                setVentaReciente(true)
                setTimeout(() => setVentaReciente(false), 5000)
            }
        } catch (e) {
            setMensajes(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'Ocurrió un error al procesar tu solicitud. Intenta de nuevo.',
                    error: true,
                },
            ])
        } finally {
            setCargando(false)
        }
    }, [mensajes, cargando])

    function limpiar() {
        setMensajes([{
            id: '0',
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de ventas 👋\n\nPuedo ayudarte a:\n- **Registrar ventas** — "véndele 2 Coca-Colas a Juan"\n- **Consultar el negocio** — "¿cuánto vendí hoy?", "¿qué me debe María?"\n- **Revisar inventario** — "¿qué productos están por agotarse?"\n\n¿En qué te ayudo?',
        }])
    }

    return { mensajes, cargando, ventaReciente, enviar, limpiar }
}