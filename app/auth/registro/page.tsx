'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegistroPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [exito, setExito] = useState(false)

    async function handleRegistro(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password.length < 6)
            return setError('La contraseña debe tener al menos 6 caracteres')
        if (password !== confirmar)
            return setError('Las contraseñas no coinciden')

        setLoading(true)
        try {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) throw error
            setExito(true)
        } catch (e: any) {
            setError(e.message === 'User already registered'
                ? 'Este correo ya está registrado'
                : e.message || 'Error al crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    if (exito) {
        return (
            <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-white text-xl font-bold mb-2">¡Cuenta creada!</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Revisa tu correo <span className="text-white font-medium">{email}</span> y confirma tu cuenta para ingresar.
                    </p>
                    <Link
                        href="/auth/login"
                        className="block w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition text-sm"
                    >
                        Ir al login
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-black">C</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold">Crear cuenta</h1>
                    <p className="text-gray-500 text-sm mt-1">Sistema de gestión Coca-Cola</p>
                </div>

                <form onSubmit={handleRegistro} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition text-sm"
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition text-sm"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Confirmar contraseña</label>
                        <input
                            type="password"
                            value={confirmar}
                            onChange={e => setConfirmar(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition text-sm"
                            placeholder="Repite la contraseña"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition text-sm"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="text-gray-600 text-sm text-center mt-6">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/auth/login" className="text-red-400 hover:text-red-300 transition">
                        Ingresar
                    </Link>
                </p>
            </div>
        </main>
    )
}