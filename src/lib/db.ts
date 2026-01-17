import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('⚠️ ERRO: Adicione MONGODB_URI no seu .env.local');
}

// --- PARTE 1: CLIENTE PARA O NEXT-AUTH (Nativo) ---
const options = {};
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // Em desenvolvimento, usa variável global para não estourar conexões no Hot Reload
    if (!(global as any)._mongoClientPromise) {
        client = new MongoClient(MONGODB_URI, options);
        (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
} else {
    // Em produção, cria conexão normal
    client = new MongoClient(MONGODB_URI, options);
    clientPromise = client.connect();
}

// --- PARTE 2: CONEXÃO PARA Mongoose (Admin API) ---
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log("✅ MongoDB (Mongoose) Conectado!");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Exporta o Default (Mongoose) para as APIs
export default connectToDatabase;

// Exporta o Named Export (Native) para o NextAuth
export { clientPromise };