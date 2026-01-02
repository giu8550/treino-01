import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

// Inicializa sem precisar de arquivos de chave manuais!
// Ele vai ler aquele arquivo .json que acabou de ser criado no seu sistema.
const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID || "bright-task-474414-h3",
    location: process.env.GOOGLE_LOCATION || "us-central1",
});

const model = vertex_ai.getGenerativeModel({ model: "gemini-1.0-pro" });

export async function POST(req: Request) {
    try {
        const { prompt, agent } = await req.json();

        // Personalidade simples
        let role = "You are a helpful assistant.";
        if (agent === "zenita") role = "You are Zenita, a concise technical expert.";
        if (agent === "ballena") role = "You are Ballena, a biology expert.";
        if (agent === "ethernaut") role = "You are Ethernaut, a math expert.";

        const fullPrompt = `${role}\n\nUser: ${prompt}`;

        console.log(`📡 Enviando para Vertex AI...`);
        const result = await model.generateContent(fullPrompt);
        const text = result.response.candidates[0].content.parts[0].text;

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("🔥 Erro:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}