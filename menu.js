// menu.js
const { VertexAI } = require("@google-cloud/vertexai");

// Seus dados
const project = "bright-task-474414-h3";
const location = "us-central1";

async function listModels() {
    console.log(`📋 Verificando cardápio em ${location}...`);

    // Vamos tentar dar um "Hello World" nos modelos mais comuns
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.0-pro",
        "gemini-1.0-pro-001",
        "gemini-pro"
    ];

    const vertex_ai = new VertexAI({ project, location });

    for (const modelName of candidates) {
        process.stdout.write(`Tentando ${modelName}... `);
        try {
            const model = vertex_ai.getGenerativeModel({ model: modelName });
            const resp = await model.generateContent("Hi");
            console.log("✅ DISPONÍVEL!");
        } catch (e) {
            if (e.message.includes("404")) {
                console.log("❌ 404 (Não encontrado/Sem acesso)");
            } else {
                console.log(`⚠️ Erro: ${e.message.split(' ')[0]}`);
            }
        }
    }
}

listModels();