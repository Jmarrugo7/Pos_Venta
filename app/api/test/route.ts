import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    try {
        // Inicializar cliente con tu API Key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        // Seleccionar modelo
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Llamar al modelo
        const result = await model.generateContent("Escribe un haiku sobre el café");

        // Obtener texto
        const texto = result.response.text();

        // Devolver respuesta JSON
        return NextResponse.json({ ok: true, texto });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
