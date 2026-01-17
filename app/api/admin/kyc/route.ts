import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import  connectToDatabase  from "@/src/lib/db"; // Use o caminho correto para seu arquivo de conexão
import User from "@/src/models/User"; // O modelo que criamos no passo anterior
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        // 1. BLOQUEIO DE SEGURANÇA TOTAL
        const session = await getServerSession(authOptions);

        // @ts-ignore - Verifica se é você (o Admin)
        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ error: "Acesso Negado: Nível Founder Requerido" }, { status: 403 });
        }

        // 2. CONEXÃO COM O MONGO
        await connectToDatabase();

        // 3. BUSCA DE USUÁRIOS REAIS
        // Traz usuários, ordenados pelos mais recentes, ocultando você da lista
        const users = await User.find({
            email: { $ne: "donmartinezcaiudoceu@gmail.com" }
        })
            .sort({ createdAt: -1 })
            .limit(100);

        // 4. TRADUÇÃO PARA O FRONTEND (Adapter)
        const formattedRequests = users.map((user) => {
            // Se o array de documentos existir e tiver itens, a fonte é formulário manual
            const hasDocs = user.documents && user.documents.length > 0;

            return {
                id: user._id.toString(),
                name: user.name || "Usuário sem Nome",
                email: user.email,
                role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student",
                status: user.kycStatus || "pending",
                walletAddress: user.walletAddress || "",
                submittedAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
                documents: user.documents || [],
                bio: user.bio || "",
                institution: user.institution || "",
                source: hasDocs ? "manual_form" : "google_quick"
            };
        });

        return NextResponse.json(formattedRequests);

    } catch (error) {
        console.error("ERRO NA API DE ADMIN:", error);
        return NextResponse.json({ error: "Erro Interno no Servidor" }, { status: 500 });
    }
}