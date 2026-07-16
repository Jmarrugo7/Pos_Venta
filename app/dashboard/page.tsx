'use client'

import { useEffect, useState } from 'react'
import { fetchConAuth } from '@/lib/db'

interface Stats {
  ventasHoy: number
  ventasSemana: number
  ventasMes: number
  productosAgotados: number
  clientesActivos: number
  deudasPendientes: number
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

const STAT_CARDS = [
  { key: 'ventasHoy', label: 'Ventas hoy', icon: '💰', color: 'coca' },
  { key: 'ventasSemana', label: 'Ventas semana', icon: '📅', color: 'blue' },
  { key: 'ventasMes', label: 'Ventas mes', icon: '📊', color: 'emerald' },
  { key: 'productosAgotados', label: 'Agotados', icon: '⚠️', color: 'amber' },
  { key: 'clientesActivos', label: 'Clientes', icon: '👥', color: 'violet' },
  { key: 'deudasPendientes', label: 'Deudas', icon: '💳', color: 'rose' },
] as const

const colorMap: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
  coca:    { bg: 'bg-coca-950/40',   border: 'border-coca-800/30',   text: 'text-coca-400',    shadow: 'shadow-coca-600/5' },
  blue:    { bg: 'bg-blue-950/40',   border: 'border-blue-800/30',   text: 'text-blue-400',    shadow: 'shadow-blue-600/5' },
  emerald: { bg: 'bg-emerald-950/40',border: 'border-emerald-800/30',text: 'text-emerald-400', shadow: 'shadow-emerald-600/5' },
  amber:   { bg: 'bg-amber-950/40',  border: 'border-amber-800/30',  text: 'text-amber-400',   shadow: 'shadow-amber-600/5' },
  violet:  { bg: 'bg-violet-950/40', border: 'border-violet-800/30', text: 'text-violet-400',  shadow: 'shadow-violet-600/5' },
  rose:    { bg: 'bg-rose-950/40',   border: 'border-rose-800/30',   text: 'text-rose-400',    shadow: 'shadow-rose-600/5' },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    ventasHoy: 0,
    ventasSemana: 0,
    ventasMes: 0,
    productosAgotados: 0,
    clientesActivos: 0,
    deudasPendientes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetchConAuth('/api/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Error cargando estadísticas:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  function formatValue(key: string, value: number) {
    if (['ventasHoy', 'ventasSemana', 'ventasMes', 'deudasPendientes'].includes(key)) {
      return formatCOP(value)
    }
    return value.toString()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
          Panel de Control
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => {
          const colors = colorMap[card.color]
          const value = stats[card.key]

          return (
            <div
              key={card.key}
              className={`${colors.bg} border ${colors.border} rounded-2xl p-5 shadow-lg ${colors.shadow} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slide-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                    {card.label}
                  </p>
                  {loading ? (
                    <div className="skeleton h-8 w-28 mt-2" />
                  ) : (
                    <p className={`text-xl md:text-2xl font-bold mt-1 ${colors.text}`}>
                      {formatValue(card.key, value)}
                    </p>
                  )}
                </div>
                <span className="text-2xl opacity-80">{card.icon}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-8 glass-card p-6">
        <h2 className="text-white font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/pos', label: 'Nueva venta', icon: '🛒', desc: 'Punto de venta' },
            { href: '/dashboard/productos', label: 'Productos', icon: '📦', desc: 'Gestionar inventario' },
            { href: '/dashboard/clientes', label: 'Clientes', icon: '👥', desc: 'Ver directorio' },
            { href: '/dashboard/estadisticas', label: 'Reportes', icon: '📈', desc: 'Ver estadísticas' },
          ].map(action => (
            <a
              key={action.href}
              href={action.href}
              className="group bg-white/[0.02] border border-white/[0.04] hover:border-coca-600/30 hover:bg-coca-950/20 rounded-xl p-4 transition-all duration-200 text-center"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </span>
              <p className="text-white text-sm font-medium">{action.label}</p>
              <p className="text-zinc-600 text-xs mt-0.5">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
