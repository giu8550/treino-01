// test-gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. COLOCAR A CHAVE DIRETO AQUI PARA O TESTE (Não use process.env agora)
const API_KEY = "AIzaSyCWyrWmYQn7yxrcJQAaW-Equ7kEE4znE6Q";

const genAI = new GoogleGenerativeAI(API_KEY);

async function runDiagnosis() {
    console.log("🔍 Iniciando Diagnóstico Zaeon...");
    console.log(`🔑 Testando chave: ${API_KEY.substring(0, 10)}...`);

    // Lista de modelos para testar``
    const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of modelsToTest) {
        console.log(`\n-----------------------------------`);
        console.log(`🤖 Testando Modelo: ${modelName}`);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Responda apenas: OK");
            const response = await result.response;
            console.log(`✅ SUCESSO! O modelo '${modelName}' está ativo e respondendo.`);
            console.log(`📝 Resposta: ${response.text()}`);
            return; // Se funcionou um, paramos por aqui. Vitória!
        } catch (error) {
            console.log(`❌ FALHA no ${modelName}.`);

            // Analisando o erro real
            if (error.message.includes("404")) {
                console.log("   Motivo: 404 Not Found (Modelo não encontrado ou API não habilitada)");
            } else if (error.message.includes("403")) {
                console.log("   Motivo: 403 Forbidden (Chave inválida ou bloqueada por região/pagamento)");
            } else {
                console.log("   Erro completo:", error.message);
            }
        }
    }

    console.log("\n-----------------------------------");
    console.log("⚠️ DIAGNÓSTICO FINAL: Nenhum modelo funcionou.");
    console.log("Possíveis causas:");
    console.log("1. A API 'Generative Language API' não está ativada no Google Cloud Console.");
    console.log("2. Sua chave expirou ou foi revogada.");
    console.log("3. Bloqueio de IP/Região.");
}

runDiagnosis();