// test-connection.js
require('dotenv').config({ path: '.env.local' }); // ou apenas .env
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

console.log("---------------------------------------------------");
console.log("🔍 Testando conexão com MONGODB_URI...");
console.log("📡 URL Oculta:", uri ? uri.replace(/:([^:@]{1,})@/, ':****@') : "NÃO ENCONTRADA");
console.log("---------------------------------------------------");

if (!uri) {
    console.error("❌ ERRO: MONGODB_URI não encontrada no .env");
    process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("✅ SUCESSO! Conexão nativa estabelecida.");
        console.log("✅ Autenticação aceita pelo MongoDB Atlas.");

        const db = client.db();
        console.log(`📂 Conectado ao banco: ${db.databaseName}`);

    } catch (err) {
        console.error("❌ FALHA NA CONEXÃO:");
        console.error(err.message);
        console.log("\n💡 DICA: Verifique se sua senha tem caracteres especiais não tratados.");
    } finally {
        await client.close();
    }
}

run();