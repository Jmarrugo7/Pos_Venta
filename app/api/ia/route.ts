import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Inicializar Gemini y Supabase
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Herramientas estructuradas para Gemini (Function Declarations) ───────────
const tools = [
    {
        functionDeclarations: [
            {
                name: 'buscar_productos',
                description: 'Busca productos disponibles en el inventario por nombre. Úsala para encontrar productos que el cliente quiere comprar.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        nombre: { type: 'STRING', description: 'Nombre o parte del nombre del producto a buscar' },
                    },
                    required: ['nombre'],
                },
            },
            {
                name: 'buscar_cliente',
                description: 'Busca un cliente registrado por su nombre.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        nombre: { type: 'STRING', description: 'Nombre o parte del nombre del cliente' },
                    },
                    required: ['nombre'],
                },
            },
            {
                name: 'crear_venta',
                description: 'Crea una venta en el sistema SOLO después de que el usuario haya confirmado explícitamente con "sí", "confirmar", "ok" o similar.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        cliente_id: { type: 'STRING', description: 'ID del cliente (opcional, null si es sin cliente)' },
                        tipo: { type: 'STRING', enum: ['contado', 'credito'], description: 'Tipo de venta' },
                        items: {
                            type: 'ARRAY',
                            description: 'Lista de productos a vender',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    producto_id: { type: 'STRING' },
                                    cantidad: { type: 'NUMBER' },
                                    precio_unitario: { type: 'NUMBER' },
                                },
                                required: ['producto_id', 'cantidad', 'precio_unitario'],
                            },
                        },
                    },
                    required: ['tipo', 'items'],
                },
            },
            {
                name: 'consultar_negocio',
                description: 'Consulta estadísticas y datos del negocio: ventas del día, semana o mes, deudas de clientes, productos agotados, etc.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        tipo: {
                            type: 'STRING',
                            enum: ['ventas_hoy', 'ventas_semana', 'ventas_mes', 'deuda_cliente', 'productos_agotados', 'productos_stock_bajo', 'deudas_totales'],
                            description: 'Tipo de consulta',
                        },
                        cliente_nombre: { type: 'STRING', description: 'Nombre del cliente (solo para deuda_cliente)' },
                    },
                    required: ['tipo'],
                },
            },
        ],
    },
] as any

// ── Ejecutores de herramientas (Se mantiene igual) ───────────────────────────
async function ejecutarHerramienta(nombre: string, input: any): Promise<string> {
    try {
        switch (nombre) {
            case 'buscar_productos': {
                const { data } = await supabase
                    .from('productos')
                    .select('id, nombre, precio_venta, cantidad, categoria')
                    .ilike('nombre', `%${input.nombre}%`)
                    .eq('activo', true)
                    .gt('cantidad', 0)
                if (!data?.length) return `No encontré productos con el nombre "${input.nombre}"`
                return JSON.stringify(data)
            }

            case 'buscar_cliente': {
                const { data } = await supabase
                    .from('clientes')
                    .select('id, nombre, saldo_pendiente')
                    .ilike('nombre', `%${input.nombre}%`)
                    .limit(5)
                if (!data?.length) return `No encontré clientes con el nombre "${input.nombre}"`
                return JSON.stringify(data)
            }

            case 'crear_venta': {
                const total = input.items.reduce(
                    (s: number, i: any) => s + i.precio_unitario * i.cantidad, 0
                )

                const { data: venta, error: ventaErr } = await supabase
                    .from('ventas')
                    .insert({ cliente_id: input.cliente_id ?? null, total, tipo: input.tipo })
                    .select()
                    .single()
                if (ventaErr) throw new Error(ventaErr.message)

                await supabase.from('venta_items').insert(
                    input.items.map((i: any) => ({
                        venta_id: venta.id,
                        producto_id: i.producto_id,
                        cantidad: i.cantidad,
                        precio_unitario: i.precio_unitario,
                    }))
                )

                for (const item of input.items) {
                    const { data: prod } = await supabase
                        .from('productos')
                        .select('cantidad')
                        .eq('id', item.producto_id)
                        .single()

                    await supabase
                        .from('productos')
                        .update({ cantidad: (prod?.cantidad ?? 0) - item.cantidad })
                        .eq('id', item.producto_id)

                    await supabase.from('movimientos_inventario').insert({
                        producto_id: item.producto_id,
                        tipo: 'salida',
                        cantidad: item.cantidad,
                        descripcion: `Venta IA #${venta.numero_factura}`,
                    })
                }

                if (input.tipo === 'credito' && input.cliente_id) {
                    const { data: cliente } = await supabase
                        .from('clientes')
                        .select('saldo_pendiente')
                        .eq('id', input.cliente_id)
                        .single()

                    await supabase
                        .from('clientes')
                        .update({ saldo_pendiente: (cliente?.saldo_pendiente ?? 0) + total })
                        .eq('id', input.cliente_id)
                }

                return JSON.stringify({
                    exito: true,
                    numero_factura: venta.numero_factura,
                    total,
                })
            }

            case 'consultar_negocio': {
                const hoy = new Date().toISOString().split('T')[0]
                const semana = (() => {
                    const d = new Date(); const dia = d.getDay()
                    d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1))
                    return d.toISOString().split('T')[0]
                })()
                const mes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    .toISOString().split('T')[0]

                switch (input.tipo) {
                    case 'ventas_hoy': {
                        const { data } = await supabase.from('ventas').select('total').gte('fecha', hoy)
                        const total = data?.reduce((s, r) => s + r.total, 0) ?? 0
                        return `Ventas de hoy: $${total.toLocaleString('es-CO')}`
                    }
                    case 'ventas_semana': {
                        const { data } = await supabase.from('ventas').select('total').gte('fecha', semana)
                        const total = data?.reduce((s, r) => s + r.total, 0) ?? 0
                        return `Ventas de esta semana: $${total.toLocaleString('es-CO')}`
                    }
                    case 'ventas_mes': {
                        const { data } = await supabase.from('ventas').select('total').gte('fecha', mes)
                        const total = data?.reduce((s, r) => s + r.total, 0) ?? 0
                        return `Ventas de este mes: $${total.toLocaleString('es-CO')}`
                    }
                    case 'deuda_cliente': {
                        const { data } = await supabase
                            .from('clientes')
                            .select('nombre, saldo_pendiente')
                            .ilike('nombre', `%${input.cliente_nombre}%`)
                        if (!data?.length) return `No encontré al cliente "${input.cliente_nombre}"`
                        return data.map(c => `${c.nombre}: $${c.saldo_pendiente.toLocaleString('es-CO')}`).join('\n')
                    }
                    case 'productos_agotados': {
                        const { data } = await supabase
                            .from('productos')
                            .select('nombre')
                            .eq('cantidad', 0)
                            .eq('activo', true)
                        if (!data?.length) return 'No hay productos agotados actualmente.'
                        return `Productos agotados: ${data.map(p => p.nombre).join(', ')}`
                    }
                    case 'productos_stock_bajo': {
                        const { data } = await supabase
                            .from('productos')
                            .select('nombre, cantidad, cantidad_minima')
                            .eq('activo', true)
                            .gt('cantidad', 0)
                        const bajos = (data ?? []).filter(p => p.cantidad <= p.cantidad_minima)
                        if (!bajos.length) return 'Todos los productos tienen stock suficiente.'
                        return `Productos con stock bajo:\n${bajos.map(p => `- ${p.nombre}: ${p.cantidad} und (mínimo: ${p.cantidad_minima})`).join('\n')}`
                    }
                    case 'deudas_totales': {
                        const { data } = await supabase
                            .from('clientes')
                            .select('nombre, saldo_pendiente')
                            .gt('saldo_pendiente', 0)
                            .order('saldo_pendiente', { ascending: false })
                        if (!data?.length) return 'No hay deudas pendientes.'
                        const total = data.reduce((s, c) => s + c.saldo_pendiente, 0)
                        const lista = data.map(c => `- ${c.nombre}: $${c.saldo_pendiente.toLocaleString('es-CO')}`).join('\n')
                        return `Total deudas: $${total.toLocaleString('es-CO')}\n\n${lista}`
                    }
                }
                return 'Consulta no reconocida'
            }

            default:
                return 'Herramienta no reconocida'
        }
    } catch (e) {
        return `Error: ${(e as Error).message}`
    }
}

// ── Prompt del sistema ────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres el asistente de ventas inteligente de una nevera de productos Coca-Cola. 
Ayudas a registrar ventas y consultar información del negocio de forma rápida y natural.

REGLAS IMPORTANTES:
1. Para registrar una venta, SIEMPRE busca primero el producto y el cliente antes de crearla.
2. NUNCA crees una venta sin pedir confirmación explícita al usuario mostrando el resumen.
3. Si hay varios productos con nombre similar, pregunta cuál es el correcto.
4. El tipo de venta por defecto es "contado". Solo usa "credito" si el usuario lo menciona.
5. Responde siempre en español, de forma breve y clara.
6. Los precios van en pesos colombianos (COP).

FLUJO PARA REGISTRAR VENTA:
1. Busca el/los producto(s) mencionados
2. Busca el cliente si se menciona uno
3. Muestra resumen: producto, cantidad, precio unitario, total y tipo de pago
4. Espera confirmación ("sí", "ok", "confirmar")
5. Solo entonces llama a crear_venta`

// ── Handler principal corregido ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json()

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No se recibieron mensajes' }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            tools: tools,
        })

        // Construir el historial formateado
        let historialPrevio = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }],
        }))

        // SOLUCIÓN AL ERROR RUNTIME: Garantizar que el historial empiece sí o sí con un 'user'
        while (historialPrevio.length > 0 && historialPrevio[0].role === 'model') {
            historialPrevio.shift()
        }

        const ultimoMensaje = messages[messages.length - 1].content

        // Iniciar el chat nativo de Gemini
        const chat = model.startChat({ history: historialPrevio })

        let result = await chat.sendMessage(ultimoMensaje)

        // SOLUCIÓN AL ERROR DE IMAGEN 2: Se invoca como función .functionCalls()
        let functionCalls = result.response.functionCalls()

        let ventaCreada = false

        // Agentic loop
        while (functionCalls && functionCalls.length > 0) {
            const toolResults = await Promise.all(
                functionCalls.map(async (call: any) => { // <-- Tipado explícito 'any' para evitar quejas de TS
                    const resultado = await ejecutarHerramienta(call.name, call.args)

                    if (call.name === 'crear_venta' && !resultado.includes('Error:')) {
                        ventaCreada = true
                    }

                    return {
                        functionResponse: {
                            name: call.name,
                            response: { content: resultado },
                        },
                    }
                })
            )

            // Enviar las respuestas de las funciones de vuelta al modelo
            result = await chat.sendMessage(toolResults)
            functionCalls = result.response.functionCalls() // <-- Se invoca como función aquí también
        }

        const texto = result.response.text()

        return NextResponse.json({ texto, ventaCreada })
    } catch (e) {
        console.error('IA error:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}