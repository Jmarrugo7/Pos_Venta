import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCOP, formatNumeroFactura } from '@/lib/utils'
import type { Factura } from '@/types/facturas'

export function generarPDFFactura(factura: Factura) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const ancho = doc.internal.pageSize.getWidth()

    // ── Encabezado ──────────────────────────────────────────────
    doc.setFillColor(220, 38, 38)
    doc.rect(0, 0, ancho, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('COCA-COLA', 14, 14)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistema de Gestión de Ventas', 14, 21)
    doc.text('Nevera de productos', 14, 27)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(formatNumeroFactura(factura.numero_factura), ancho - 14, 14, { align: 'right' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('FACTURA DE VENTA', ancho - 14, 21, { align: 'right' })

    if (factura.estado === 'anulada') {
        doc.setTextColor(255, 200, 200)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('ANULADA', ancho - 14, 29, { align: 'right' })
    }

    // ── Info factura ────────────────────────────────────────────
    doc.setTextColor(30, 30, 30)
    let y = 45

    const fecha = new Date(factura.fecha)
    const fechaStr = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    const horaStr = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    doc.setFillColor(248, 248, 248)
    doc.roundedRect(14, y, 85, 30, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text('CLIENTE', 19, y + 7)
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.text(factura.cliente?.nombre ?? 'Consumidor final', 19, y + 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(factura.tipo === 'credito' ? 'Venta a crédito' : 'Venta de contado', 19, y + 22)

    doc.setFillColor(248, 248, 248)
    doc.roundedRect(105, y, 91, 30, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text('FECHA DE EMISIÓN', 110, y + 7)
    doc.setFontSize(10)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.text(fechaStr, 110, y + 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Hora: ${horaStr}`, 110, y + 22)

    y += 38

    // ── Tabla de productos ──────────────────────────────────────
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DE PRODUCTOS', 14, y)
    y += 4

    const filas = (factura.items ?? []).map(item => [
        item.producto?.nombre ?? '—',
        String(item.cantidad),
        formatCOP(item.precio_unitario),
        formatCOP(item.precio_unitario * item.cantidad),
    ])

    autoTable(doc, {
        startY: y,
        head: [['Producto', 'Cant.', 'Precio unitario', 'Subtotal']],
        body: filas,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 85 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' },
        },
        alternateRowStyles: { fillColor: [252, 252, 252] },
        margin: { left: 14, right: 14 },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 6

    doc.setFillColor(220, 38, 38)
    doc.roundedRect(ancho - 80, finalY, 66, 18, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('TOTAL A PAGAR', ancho - 77, finalY + 7)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCOP(factura.total), ancho - 16, finalY + 14, { align: 'right' })

    doc.setTextColor(120, 120, 120)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Método de pago: ${factura.tipo === 'contado' ? 'Contado (Efectivo/QR)' : 'Crédito'}`, 14, finalY + 10)

    if (factura.estado === 'anulada') {
        doc.setTextColor(180, 40, 40)
        doc.setFontSize(8)
        doc.text(`Factura anulada${factura.motivo_anulacion ? ': ' + factura.motivo_anulacion : ''}`, 14, finalY + 18)
    }

    const pY = doc.internal.pageSize.getHeight() - 12
    doc.setFillColor(245, 245, 245)
    doc.rect(0, pY - 6, ancho, 18, 'F')
    doc.setTextColor(160, 160, 160)
    doc.setFontSize(7)
    doc.text('Gracias por su compra • Sistema Coca-Cola', ancho / 2, pY + 2, { align: 'center' })

    doc.save(`Factura-${formatNumeroFactura(factura.numero_factura)}.pdf`)
}