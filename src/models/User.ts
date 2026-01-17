import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    image: String,
    emailVerified: Date,

    // --- CAMPOS PERSONALIZADOS ZAEON (O que o Admin gerencia) ---
    role: {
        type: String,
        enum: ["student", "researcher", "professional", "entrepreneur"],
        default: "student"
    },
    phone: String,
    identityId: String, // O ID que ele digita no modal
    identityType: String, // 'wallet' ou 'role_id'

    // KYC & Compliance (Dados Institucionais)
    institution: String,
    bio: String,
    walletAddress: String,

    // Array de Documentos para sua análise no Painel Admin
    documents: [
        {
            name: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now }
        }
    ],

    // Controle de Status pelo Founder
    kycStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    // O MongoDB Adapter do NextAuth às vezes insere campos extras;
    // strict: false garante que isso não quebre o código.
    strict: false
});

const User = models.User || model("User", UserSchema);

export default User;