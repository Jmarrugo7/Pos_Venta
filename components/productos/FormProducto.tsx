'use client'

import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import { formatCOP } from '@/lib/utils'
import type { Producto, ProductoInsert } from '@/types'

const FORM_VACIO: ProductoInsert = {
  nombre: '',
  categoria: '',
  precio_venta: 0,
  costo_compra: 0,
  cantidad: 0,
  cantidad_minima: 0,
  activo: true,
}

const CAMPOS: { key: keyof ProductoInsert; label: string; type: string; placeholder: string }[] = [
  { key: 'nombre', label: 'Nombre del producto', type: 'text', placeholder: 'Ej: Coca-Cola 350ml' },
  { key: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Ej: Bebidas' },
  { key: 'precio_venta', label: 'Precio de venta', type: 'number', placeholder: 'Ej: 3000' },
  { key: 'costo_compra', label: 'Costo de compra', type: 'number', placeholder: 'Ej: 2000' },
  { key: 'cantidad', label: 'Cantidad en inventario', type: 'number', placeholder: 'Ej: 50' },
  { key: 'cantidad_minima', label: 'Stock mínimo (alerta)', type: 'number', placeholder: 'Ej: 5' },
]

interface FormProductoProps {
  abierto: boolean
  editando: Producto | null
  onGuardar: (data: ProductoInsert) => Promise<void>
  onCerrar: () => void
}

export function FormProducto({ abierto, editando, onGuardar, onCerrar }: FormProductoProps) {
  const [form, setForm] = useState<ProductoInsert>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editando) {
      setForm({
        nombre: editando.nombre,
        categoria: editando.categoria || '',
        precio_venta: editando.precio_venta,
        costo_compra: editando.costo_compra,
        cantidad: editando.cantidad,
        cantidad_minima: editando.cantidad_minima,
        activo: editando.activo,
      })
    } else {
      setForm(FORM_VACIO)
    }
    setError('')
  }, [editando, abierto])

  function setField(key: keyof ProductoInsert, value: string | number | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // Para campos numéricos: muestra vacío si el valor es 0, así el placeholder es visible
  function valorNumerico(key: keyof ProductoInsert) {
    const v = form[key] as number
    return v === 0 ? '' : String(v)
  }

  async function handleGuardar() {
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (form.precio_venta <= 0) return setError('El precio de venta debe ser mayor a 0')
    if (form.costo_compra < 0) return setError('El costo no puede ser negativo')
    if (form.precio_venta < form.costo_compra) return setError('El precio de venta no puede ser menor al costo')

    setGuardando(true)
    setError('')
    try {
      await onGuardar(form)
      setForm(FORM_VACIO)
    } catch (e) {
      setError((e as Error).message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const ganancia = form.precio_venta - form.costo_compra

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={editando ? 'Editar producto' : 'Nuevo producto'}
    >
      <div className="space-y-3">
        {CAMPOS.map(({ key, label, type, placeholder }) => (
          <Input
            key={key}
            label={label}
            type={type}
            placeholder={placeholder}
            value={type === 'number' ? valorNumerico(key) : (form[key] as string)}
            min={type === 'number' ? 0 : undefined}
            onChange={e => setField(
              key,
              type === 'number'
                ? (e.target.value === '' ? 0 : Number(e.target.value))
                : e.target.value
            )}
          />
        ))}

        {(form.precio_venta > 0 || form.costo_compra > 0) && (
          <div className={`rounded-lg px-4 py-3 text-sm flex justify-between items-center ${ganancia >= 0 ? 'bg-green-950 border border-green-900' : 'bg-red-950 border border-red-900'
            }`}>
            <span className="text-gray-400">Ganancia unitaria</span>
            <span className={`font-bold ${ganancia >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCOP(ganancia)}
            </span>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </Modal>
  )
}