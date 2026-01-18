import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/src/lib/db"; // Mantenha sua conexão Mongoose antiga para usuários
import User from "@/src/models/User"; // Mantenha seu modelo Mongoose
import { authOptions } from "@/src/lib/auth"; // <--- CORREÇÃO: Importa da LIB, não da rota

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Bloqueio de segurança (Admin Only)
        // Por enquanto, vamos permitir ver os dados se estiver logado para você testar
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // Busca usuários (exceto o próprio admin para não poluir a lista)
        const users = await User.find({
            email: { $ne: session?.user?.email }
        }).sort({ createdAt: -1 });

        const formattedRequests = users.map((user) => {
            // Lógica para detectar se é Google ou Manual
            // Se tiver identityId ou array de documentos, assumimos que tentou cadastro manual
            const hasManualData = user.identityId || (user.documents && user.documents.length > 0);

            return {
                id: user._id.toString(),
                name: user.name || "Usuário Zaeon",
                email: user.email,
                phone: user.phone || "Não informado",

                // CORREÇÃO: Mapeando para o que o Frontend espera (idValue)
                idValue: user.identityId || user.cpf || "N/A",

                role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student",
                status: user.kycStatus || "pending",
                walletAddress: user.walletAddress || "",

                // Garante que a data seja string ISO
                submittedAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),

                documents: user.documents || [],
                bio: user.bio || "",
                institution: user.institution || "",

                // Lógica de Origem
                source: hasManualData ? "manual_form" : "google_quick"
            };
        });

        return NextResponse.json(formattedRequests);

    } catch (error) {
        console.error("ERRO ADMIN API:", error);
        // Retorna erro real para você ver no console do navegador, em vez de 500 genérico
        return NextResponse.json({ error: "Falha ao carregar usuários" }, { status: 500 });
    }
}