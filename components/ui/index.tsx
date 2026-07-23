// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-red-600 hover:bg-red-500 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
    danger: 'bg-red-950 hover:bg-red-900 text-red-400',
    ghost: 'hover:bg-gray-800 text-gray-400 hover:text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-400 text-sm mb-1">{label}</label>
      )}
      <input
        className={`w-full bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-700'
          } rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: React.ReactNode
}

export function Modal({ abierto, onCerrar, titulo, children }: ModalProps) {
  if (!abierto) return null
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-base sm:text-lg pr-4">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-white transition text-xl leading-none shrink-0"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue'

interface BadgeProps {
  color: BadgeColor
  children: React.ReactNode
}

const badgeColors: Record<BadgeColor, string> = {
  green: 'bg-green-900 text-green-400',
  yellow: 'bg-yellow-900 text-yellow-400',
  red: 'bg-red-900 text-red-400',
  gray: 'bg-gray-800 text-gray-500',
  blue: 'bg-blue-900 text-blue-400',
}

export function Badge({ color, children }: BadgeProps) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColors[color]}`}>
      {children}
    </span>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  accion?: React.ReactNode
}

export function PageHeader({ titulo, subtitulo, accion }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-white text-xl sm:text-2xl font-bold">{titulo}</h1>
        {subtitulo && <p className="text-gray-500 text-sm mt-0.5">{subtitulo}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}

// ─── LoadingRows ──────────────────────────────────────────────────────────────
export function LoadingRows({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <tbody>
      {Array(rows).fill(0).map((_, i) => (
        <tr key={i} className="border-b border-gray-800">
          {Array(cols).fill(0).map((_, j) => (
            <td key={j} className="py-3 pr-4">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ mensaje, icono = '📭' }: { mensaje: string; icono?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">{icono}</div>
      <p className="text-gray-500 text-sm">{mensaje}</p>
    </div>
  )
}

export { ModalConfirmar } from './ModalConfirmar'
