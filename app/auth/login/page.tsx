'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-coca flex items-center justify-center px-4 relative overflow-hidden">
      {/* Orbes decorativos de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-coca-600/[0.07] blur-3xl animate-float" />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-coca-700/[0.05] blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-coca-500/[0.03] blur-2xl" />
      </div>

      {/* Patrón de puntos sutil */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Card de login */}
      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="glass-card p-8 md:p-10">
          {/* Logo y branding */}
          <div className="text-center mb-10">
            {/* Icono con glow */}
            <div className="relative inline-flex mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-coca-500 to-coca-700 rounded-2xl flex items-center justify-center shadow-lg shadow-coca-600/20 animate-pulse-glow">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-md">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3" />
                  <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter, sans-serif">C</text>
                </svg>
              </div>
              {/* Anillo decorativo */}
              <div className="absolute -inset-1 rounded-2xl border border-coca-500/20 animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            <h1 className="text-white text-2xl font-bold tracking-tight">
              Panel <span className="text-coca-400">Coca-Cola</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1.5 font-light">
              Sistema de ventas y administración
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de correo */}
            <div className="group">
              <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-coca-500 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-800/50 text-white border border-white/[0.06] rounded-xl pl-12 pr-4 py-3.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-coca-500/50 focus:bg-surface-800 focus:ring-1 focus:ring-coca-500/20 transition-all duration-200"
                  placeholder="admin@correo.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="group">
              <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-coca-500 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-800/50 text-white border border-white/[0.06] rounded-xl pl-12 pr-4 py-3.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-coca-500/50 focus:bg-surface-800 focus:ring-1 focus:ring-coca-500/20 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-coca-950/50 border border-coca-900/40 rounded-xl px-4 py-3 animate-slide-down">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-coca-400 shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-coca-300 text-sm">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-coca-600 to-coca-700 hover:from-coca-500 hover:to-coca-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-coca-600/20 hover:shadow-coca-500/30 active:scale-[0.98]"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </span>
            </button>
          </form>



          {/* Enlace a registro */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center space-y-4">
            <p className="text-zinc-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link
                href="/auth/registro"
                className="text-coca-400 hover:text-coca-300 font-semibold transition-colors duration-200 inline-flex items-center gap-1 group"
              >
                Regístrate aquí
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transform group-hover:translate-x-0.5 transition-transform duration-200"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </p>
            <p className="text-zinc-600 text-xs">
              © {new Date().getFullYear()} Coca-Cola • Sistema de gestión
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}