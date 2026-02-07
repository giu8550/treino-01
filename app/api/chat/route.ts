import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    console.log("🚀 [API START] Iniciando Chat com Vertex AI...");

    try {
        const { prompt, agent, fileData } = await req.json();

        // --- ESTRATÉGIA: LER ARQUIVO JSON DIRETO ---
        // Isso evita 100% dos erros de formatação do .env
        let credentials;
        try {
            // Caminho para o arquivo na raiz do projeto
            const keyFilePath = path.join(process.cwd(), 'service-account.json');
            
            if (fs.existsSync(keyFilePath)) {
                console.log("📂 Lendo credenciais de: service-account.json");
                const rawData = fs.readFileSync(keyFilePath, 'utf-8');
                credentials = JSON.parse(rawData);
            } else {
                // Fallback para Vercel/Produção (caso use variáveis de ambiente lá no futuro)
                console.log("⚠️ Arquivo não encontrado, tentando .env...");
                if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY_BASE64) {
                     throw new Error("Nenhuma credencial encontrada (Nem arquivo JSON, nem .env)");
                }
                credentials = {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8')
                };
            }
        } catch (fileError: any) {
            console.error("❌ Erro ao ler credenciais:", fileError.message);
            throw new Error("Falha na leitura das credenciais de autenticação.");
        }

        // --- CONEXÃO GOOGLE ---
        const vertex_ai = new VertexAI({
            project: "bright-task-474414-h3",
            location: "us-central1",
            googleAuthOptions: {
                credentials: {
                    client_email: credentials.client_email,
                    private_key: credentials.private_key, // O JSON já entrega formatado perfeitamente
                }
            }
        });

        console.log("🤖 Vertex AI Inicializado.");
        
        // --- CONFIGURAÇÃO DO MODELO ---
        // Use 'gemini-1.5-flash' se o 2.0 ainda não estiver disponível na sua conta
        const model = vertex_ai.getGenerativeModel({ model: "gemini-2.0-flash-001" });

        // --- PREPARAÇÃO DO CONTEÚDO ---
        let systemInstruction = "You are a helpful assistant.";
        if (agent === "zenita") systemInstruction = "Você é a Zenita, uma IA raposa cyberpunk sarcástica e técnica.";
        if (agent === "ethernaut") systemInstruction = "Você é o Ethernaut, especialista sênior em Blockchain.";

        const parts: any[] = [];
        
        if (fileData) {
            console.log("📎 Anexando arquivo PDF...");
            parts.push({
                inlineData: {
                    data: fileData,
                    mimeType: "application/pdf"
                }
            });
        }

        parts.push({ text: `${systemInstruction}\n\nUser Question: ${prompt}` });

        // --- GERAÇÃO ---
        console.log("⚡ Gerando resposta...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: parts }],
        });

        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) throw new Error("A IA devolveu uma resposta vazia.");

        console.log("✅ Sucesso!");
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("🔥 ERRO FATAL:", error);
        return NextResponse.json({ 
            error: "Erro no processamento", 
            details: error.message,
            code: error.code 
        }, { status: 500 });
    }
}