'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { BurbujaMensaje } from '@/components/ia/BurbujaMensaje'
import { SugerenciasRapidas } from '@/components/ia/SugerenciasRapidas'

export default function IAPage() {
    const { mensajes, cargando, ventaReciente, enviar, limpiar } = useChat()
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const soloMensajeInicial = mensajes.length === 1

    // Auto-scroll al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mensajes])

    async function handleEnviar() {
        const texto = input.trim()
        if (!texto || cargando) return
        setInput('')
        await enviar(texto)
        inputRef.current?.focus()
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleEnviar()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-white text-2xl font-bold">IA Chat</h1>
                    <p className="text-gray-500 text-sm">Registra ventas y consulta el negocio en lenguaje natural</p>
                </div>
                <div className="flex items-center gap-3">
                    {ventaReciente && (
                        <div className="bg-green-950 border border-green-800 text-green-400 text-xs px-3 py-1.5 rounded-full animate-pulse">
                            ✅ Venta registrada
                        </div>
                    )}
                    <button
                        onClick={limpiar}
                        className="text-gray-500 hover:text-white text-sm transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
                    >
                        🗑 Limpiar chat
                    </button>
                </div>
            </div>

            {/* Área de chat */}
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mensajes.map(m => (
                        <BurbujaMensaje key={m.id} mensaje={m} />
                    ))}

                    {/* Sugerencias rápidas si solo está el mensaje inicial */}
                    {soloMensajeInicial && (
                        <SugerenciasRapidas
                            onSeleccionar={(texto) => {
                                setInput(texto)
                                inputRef.current?.focus()
                            }}
                        />
                    )}

                    {/* Indicador de carga */}
                    {cargando && (
                        <div className="flex justify-start">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0">
                                IA
                            </div>
                            <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-800 p-4">
                    <div className="flex gap-3 items-end">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Escribe aquí... Ej: "véndele 3 Coca-Colas a Juan a crédito"'
                            rows={1}
                            disabled={cargando}
                            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 resize-none disabled:opacity-50 placeholder:text-gray-600"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = 'auto'
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                            }}
                        />
                        <button
                            onClick={handleEnviar}
                            disabled={!input.trim() || cargando}
                            className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
                        >
                            {cargando ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="text-gray-700 text-xs mt-2 text-center">
                        Enter para enviar · Shift+Enter para nueva línea
                    </p>
                </div>
            </div>
        </div>
    )
}