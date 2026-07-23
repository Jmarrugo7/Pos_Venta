'use client'

interface ModalConfirmarProps {
    abierto: boolean
    titulo: string
    descripcion: string
    labelConfirmar?: string
    labelCancelar?: string
    peligroso?: boolean
    onConfirmar: () => void
    onCancelar: () => void
}

export function ModalConfirmar({
    abierto,
    titulo,
    descripcion,
    labelConfirmar = 'Confirmar',
    labelCancelar = 'Cancelar',
    peligroso = false,
    onConfirmar,
    onCancelar,
}: ModalConfirmarProps) {
    if (!abierto) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl">
                {/* Icono */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${peligroso ? 'bg-red-950' : 'bg-yellow-950'
                    }`}>
                    <span className="text-2xl">{peligroso ? '🗑' : '⚠️'}</span>
                </div>

                {/* Texto */}
                <h3 className="text-white font-bold text-lg text-center mb-2">{titulo}</h3>
                <p className="text-gray-400 text-sm text-center mb-6">{descripcion}</p>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancelar}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl text-sm transition"
                    >
                        {labelCancelar}
                    </button>
                    <button
                        onClick={onConfirmar}
                        className={`flex-1 font-medium py-2.5 rounded-xl text-sm transition ${peligroso
                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            }`}
                    >
                        {labelConfirmar}
                    </button>
                </div>
            </div>
        </div>
    )
}