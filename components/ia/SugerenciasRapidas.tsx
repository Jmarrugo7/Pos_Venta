'use client'

const SUGERENCIAS = [
    { icono: '📊', texto: '¿Cuánto vendí hoy?' },
    { icono: '📦', texto: '¿Qué productos están por agotarse?' },
    { icono: '💳', texto: '¿Cuáles son las deudas pendientes?' },
    { icono: '🛒', texto: 'Registrar una venta' },
]

interface SugerenciasRapidasProps {
    onSeleccionar: (texto: string) => void
}

export function SugerenciasRapidas({ onSeleccionar }: SugerenciasRapidasProps) {
    return (
        <div className="grid grid-cols-2 gap-2 p-4">
            {SUGERENCIAS.map(s => (
                <button
                    key={s.texto}
                    onClick={() => onSeleccionar(s.texto)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-3 text-left transition"
                >
                    <span className="text-lg">{s.icono}</span>
                    <p className="text-gray-300 text-xs mt-1">{s.texto}</p>
                </button>
            ))}
        </div>
    )
}