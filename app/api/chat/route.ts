import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// --- 1. DEFINIÇÃO DA FERRAMENTA DE AGENDA (Function Calling) ---
// Isso diz para a IA: "Se precisar mexer na agenda, use esta ferramenta"
const tools = [
    {
        type: "function" as const,
        function: {
            name: "update_schedule",
            description: "Adiciona, remove ou atualiza uma aula/evento na agenda semanal do usuário.",
            parameters: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["add", "remove", "update"],
                        description: "A ação a ser realizada."
                    },
                    day: {
                        type: "number",
                        enum: [1, 2, 3, 4, 5],
                        description: "Dia da semana: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta."
                    },
                    hour: {
                        type: "number",
                        description: "Hora da aula (formato 24h, ex: 14 para 14:00)."
                    },
                    name: { type: "string", description: "Nome da matéria ou evento." },
                    teacher: { type: "string", description: "Nome do professor ou mentor." },
                    room: { type: "string", description: "Sala ou local (ex: Lab 402, Virtual)." }
                },
                required: ["action", "day", "hour"]
            }
        }
    }
];

// --- 2. PERSONALIDADES (Trazidas do código antigo) ---
const AGENT_PERSONAS: Record<string, string> = {
    zenita: `Você é a Zenita, uma IA raposa cyberpunk sarcástica e técnica.
             Você ajuda o usuário a organizar a vida acadêmica e projetos.
             Se o usuário pedir para mudar a agenda, USE A FERRAMENTA 'update_schedule'.`,
    
    ethernaut: `Você é o Ethernaut, especialista sênior em Blockchain e Sistemas.
                Foco em precisão técnica e dados.`,
                
    aura: `Você é "Aura", o Concierge Pessoal.
           Seu objetivo é organizar a vida do usuário.
           Se o usuário pedir para mudar a agenda, USE A FERRAMENTA 'update_schedule'.`
};

export async function POST(req: Request) {
    console.log("🚀 [API START] Iniciando Chat com Groq AI...");

    try {
        const { prompt, agent, systemContext } = await req.json();

        // 1. Seleciona a Persona
        const selectedPersona = AGENT_PERSONAS[agent?.toLowerCase()] || AGENT_PERSONAS.zenita;

        // 2. Monta o System Prompt com Contexto da Agenda
        const systemInstruction = `
            ${selectedPersona}
            
            [CONTEXTO ATUAL DA AGENDA]:
            ${systemContext ? systemContext : "Nenhuma agenda carregada."}
            
            [REGRAS]:
            - Se o usuário pedir para adicionar/remover/mudar aula, NÃO responda apenas com texto. CHAME a função 'update_schedule'.
            - Dias: 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex.
        `;

        const messages: any[] = [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ];

        // 3. Chamada Groq com Tools
        console.log("⚡ Enviando requisição para Groq...");
        
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 1024,
            tools: tools,           // Habilita ferramentas
            tool_choice: "auto"     // Deixa a IA decidir se usa ou não
        });

        const responseMessage = completion.choices[0]?.message;
        const toolCalls = responseMessage?.tool_calls;

        // 4. Se a IA decidiu chamar a ferramenta (Mágica acontece aqui)
        if (toolCalls && toolCalls.length > 0) {
            console.log("🛠️ IA solicitou alteração na agenda:", toolCalls[0].function.name);
            
            return NextResponse.json({
                text: "Processando alteração na agenda...", // Feedback visual rápido
                toolCall: {
                    name: toolCalls[0].function.name,
                    args: JSON.parse(toolCalls[0].function.arguments)
                }
            });
        }

        // 5. Resposta normal de texto
        const text = responseMessage?.content;
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("🔥 ERRO FATAL (Groq):", error);
        return NextResponse.json({ 
            error: "Erro no processamento com Groq", 
            details: error.message 
        }, { status: 500 });
    }
}