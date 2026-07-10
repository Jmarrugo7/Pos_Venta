'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '📊' },
  { href: '/dashboard/pos', label: 'Punto de Venta', icon: '🛒' },
  { href: '/dashboard/ia', label: 'IA Chat', icon: '🤖' },
  { href: '/dashboard/productos', label: 'Productos', icon: '📦' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
  { href: '/dashboard/inventario', label: 'Inventario', icon: '🏭' },
  { href: '/dashboard/facturas', label: 'Facturas', icon: '🧾' },
  { href: '/dashboard/deudas', label: 'Deudas', icon: '💳' },
  { href: '/dashboard/estadisticas', label: 'Estadísticas', icon: '📈' },
]

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const activo = pathname === href
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${activo
          ? 'bg-red-600 text-white font-medium'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  )
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const small = size === 'sm'
  return (
    <div className="flex items-center gap-2">
      <div className={`${small ? 'w-8 h-8' : 'w-9 h-9'} bg-red-600 rounded-xl flex items-center justify-center`}>
        <span className={`text-white font-black ${small ? 'text-sm' : ''}`}>C</span>
      </div>
      {!small && (
        <div>
          <p className="text-white font-bold text-sm">Coca-Cola</p>
          <p className="text-gray-500 text-xs">Sistema de ventas</p>
        </div>
      )}
      {small && <span className="text-white font-bold text-sm">Coca-Cola</span>}
    </div>
  )
}

// ─── Sidebar escritorio ───────────────────────────────────────────────────────
export function Sidebar() {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/auth/login')
  }

  return (
    <aside className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col">
      <div className="p-6 border-b border-gray-800">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg text-sm transition"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

// ─── Header móvil ─────────────────────────────────────────────────────────────
export function MobileHeader() {
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <>
      <header className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-gray-400 text-xl"
        >
          {menuAbierto ? '✕' : '☰'}
        </button>
      </header>

      {menuAbierto && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pb-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuAbierto(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${pathname === item.href ? 'text-red-400 font-medium' : 'text-gray-400'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}