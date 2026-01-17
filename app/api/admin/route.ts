import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/src/lib/db";
import User from "@/src/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Bloqueio de segurança (Descomente após os testes de desenvolvimento)
        // if (!session || !(session.user as any)?.isAdmin) {
        //     return NextResponse.json({ error: "Acesso Negado" }, { status: 403 });
        // }

        await connectToDatabase();

        // Busca todos os usuários, exceto o admin logado
        const users = await User.find({
            email: { $ne: session?.user?.email }
        }).sort({ createdAt: -1 });

        const formattedRequests = users.map((user) => {
            // Lógica para definir a fonte dos dados
            const hasManualData = user.identityId || (user.documents && user.documents.length > 0);

            return {
                id: user._id.toString(),
                name: user.name || "Usuário sem Nome",
                email: user.email,
                // Garantir que o role venha do banco ou seja Student por padrão
                role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student",
                status: user.kycStatus || "pending",
                walletAddress: user.walletAddress || "",
                submittedAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
                documents: user.documents || [],
                bio: user.bio || "",
                institution: user.institution || "",
                // Se o usuário tem ID ou Docs, veio do formulário, senão foi login direto
                source: hasManualData ? "manual_form" : "google_quick",
                phone: user.phone || "Não informado",
                identityId: user.identityId || "N/A"
            };
        });

        return NextResponse.json(formattedRequests);
    } catch (error) {
        console.error("ERRO NA API DE ADMIN:", error);
        return NextResponse.json({ error: "Erro ao buscar dados reais" }, { status: 500 });
    }
}