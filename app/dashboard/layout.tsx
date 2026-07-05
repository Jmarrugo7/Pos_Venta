'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSession, logout } from '@/lib/auth'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '📊' },
  { href: '/dashboard/pos', label: 'Punto de Venta', icon: '🛒' },
  { href: '/dashboard/ia', label: 'IA Chat', icon: '🤖' },
  { href: '/dashboard/productos', label: 'Inventario', icon: '📦' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
  { href: '/dashboard/inventario', label: 'Movimientos', icon: '🏭' },
  { href: '/dashboard/deudas', label: 'Deudas', icon: '💳' },
  { href: '/dashboard/estadisticas', label: 'Estadísticas', icon: '📈' },
]

function NavLink({ href, label, icon, onClick }: { href: string; label: string; icon: string; onClick?: () => void }) {
  const pathname = usePathname()
  const activo = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${activo
          ? 'bg-gradient-to-r from-coca-600 to-coca-700 text-white shadow-md shadow-coca-600/15'
          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
        }`}
    >
      <span className={`text-base transition-transform duration-200 ${!activo ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </span>
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    getSession().then(session => {
      if (!session) router.push('/auth/login')
      else setChecking(false)
    })
  }, [router])

  async function handleLogout() {
    await logout()
    router.push('/auth/login')
  }

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  if (checking) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-coca-500 to-coca-700 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verificando sesión...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex">
      {/* ══════════ Sidebar escritorio ══════════ */}
      <aside className="hidden md:flex w-[260px] glass flex-col fixed inset-y-0 left-0 z-40 border-r border-white/[0.04]">
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-coca-500 to-coca-700 rounded-xl flex items-center justify-center shadow-md shadow-coca-600/20">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight">Coca-Cola</p>
              <p className="text-zinc-600 text-xs">Sistema de ventas</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="p-3 border-t border-white/[0.04]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-coca-400 hover:bg-coca-950/30 rounded-xl text-sm font-medium transition-all duration-200 group"
          >
            <span className="group-hover:scale-110 transition-transform duration-200">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ══════════ Contenido principal ══════════ */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* Header móvil */}
        <header className="md:hidden glass border-b border-white/[0.04] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-coca-500 to-coca-700 rounded-lg flex items-center justify-center shadow-sm shadow-coca-600/20">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="text-white font-bold text-sm">Coca-Cola</span>
          </div>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            {menuAbierto ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </header>

        {/* Menú móvil desplegable */}
        {menuAbierto && (
          <div className="md:hidden glass border-b border-white/[0.04] px-3 pb-3 space-y-1 animate-slide-down">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.href} {...item} onClick={() => setMenuAbierto(false)} />
            ))}
            <div className="pt-2 mt-2 border-t border-white/[0.04]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-coca-400 rounded-xl text-sm transition-all"
              >
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {/* Página */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}