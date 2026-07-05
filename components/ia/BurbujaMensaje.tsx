'use client'

import type { Mensaje } from '@/hooks/useChat'

function renderTexto(texto: string) {
    // Convertir markdown básico a JSX
    const lineas = texto.split('\n')
    return lineas.map((linea, i) => {
        // Bold
        linea = linea.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Listas
        if (linea.startsWith('- ')) {
            return (
                <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: linea.slice(2) }} />
            )
        }
        if (linea === '') return <br key={i} />
        return <p key={i} dangerouslySetInnerHTML={{ __html: linea }} />
    })
}

interface BurbujaMensajeProps {
    mensaje: Mensaje
}

export function BurbujaMensaje({ mensaje }: BurbujaMensajeProps) {
    const esUsuario = mensaje.role === 'user'

    return (
        <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
            {!esUsuario && (
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
                    IA
                </div>
            )}

            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${esUsuario
                        ? 'bg-red-600 text-white rounded-tr-none'
                        : mensaje.error
                            ? 'bg-red-950 border border-red-900 text-red-300 rounded-tl-none'
                            : mensaje.ventaCreada
                                ? 'bg-green-950 border border-green-800 text-green-100 rounded-tl-none'
                                : 'bg-gray-800 text-gray-100 rounded-tl-none'
                    }`}
            >
                {mensaje.ventaCreada && (
                    <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-medium">
                        <span>✅</span> Venta registrada exitosamente
                    </div>
                )}
                <div className="space-y-0.5">
                    {renderTexto(mensaje.content)}
                </div>
            </div>
        </div>
    )
}