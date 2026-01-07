import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

// 1. Aumenta o tempo limite para 60 segundos (essencial para PDFs densos)
export const maxDuration = 60;

const vertex_ai = new VertexAI({
    project: "bright-task-474414-h3",
    location: "us-central1",
});

export async function POST(req: Request) {
    try {
        const { prompt, agent, fileData } = await req.json();

        // Log de debug para o terminal do VS Code
        console.log(`📡 Recebido: Prompt=${prompt.slice(0, 20)}... | PDF=${fileData ? 'Sim' : 'Não'}`);

        let systemInstruction = "You are a helpful assistant.";
        if (agent === "zenita") systemInstruction = "Você é a Zenita, uma IA raposa cyberpunk sarcástica. Analise documentos com humor ácido e precisão técnica.";
        if (agent === "ethernaut") systemInstruction = "Você é o Ethernaut, especialista em blockchain e Move.";

        // 2. Usando o modelo Pro (O Flash pode falhar com muitos tokens de PDF)
        const model = vertex_ai.getGenerativeModel({
            model: "gemini-2.5-pro",
        });

        const parts: any[] = [];

        if (fileData) {
            parts.push({
                inlineData: {
                    data: fileData,
                    mimeType: "application/pdf"
                }
            });
        }

        parts.push({ text: `${systemInstruction}\n\nUser Question: ${prompt}` });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: parts }],
        });

        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Zenita ficou sem palavras.";

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("🔥 ERRO NA ROTA API:", error.message);
        return NextResponse.json({ error: "Falha na análise", details: error.message }, { status: 500 });
    }
}