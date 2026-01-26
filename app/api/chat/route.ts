import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

// 1. Aumenta o tempo limite para 60 segundos
export const maxDuration = 60;
// Força o runtime Node.js (necessário para bibliotecas de autenticação do Google)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompt, agent, fileData } = await req.json();

        // --- AUTENTICAÇÃO MANUAL PARA VERCEL ---
        // A Vercel não tem login local (gcloud), então passamos as credenciais via código.
        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') // Corrige quebras de linha na Vercel
            : undefined;

        const vertex_ai = new VertexAI({
            project: "bright-task-474414-h3",
            location: "us-central1",
            googleAuthOptions: {
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: privateKey,
                }
            }
        });
        // ----------------------------------------

        console.log(`📡 Recebido: Prompt=${prompt ? prompt.slice(0, 20) : 'Sem prompt'}... | PDF=${fileData ? 'Sim' : 'Não'}`);

        let systemInstruction = "You are a helpful assistant.";
        if (agent === "zenita") systemInstruction = "Você é a Zenita, uma IA raposa cyberpunk engraçada. Analise documentos com humor e precisão técnica.";
        if (agent === "ethernaut") systemInstruction = "Você é o Ethernaut, especialista em blockchain e Move.";

        const model = vertex_ai.getGenerativeModel({
            model: "gemini-1.5-pro-preview-0409", // Ou "gemini-1.5-pro", verifique a disponibilidade do 2.5
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
        console.error("🔥 ERRO NA ROTA API:", error);
        return NextResponse.json({ error: "Falha na análise", details: error.message }, { status: 500 });
    }
}