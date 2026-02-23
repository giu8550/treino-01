import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth'; // Verifique se este é o caminho correto do seu authOptions
import { prisma } from '@/src/lib/prisma';    // Verifique se este é o caminho correto do seu prisma client

export const dynamic = 'force-dynamic';

// --- MÉTODO GET: Busca os dados do usuário ao carregar a página ---
export async function GET(req: Request) {
    try {
        // 1. Pega a sessão ativa do usuário
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
        }

        // 2. Busca o usuário pelo e-mail para garantir que temos o ID correto do MongoDB
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        // 3. Busca o Espaço de Trabalho do Usuário (UserSpaceData)
        const userSpace = await prisma.userSpaceData.findUnique({
            where: { userId: user.id }
        });

        // Retorna os dados para o frontend (O frontend espera { data: { layoutState: ... } })
        return NextResponse.json({ data: userSpace });

    } catch (error: any) {
        console.error("❌ Erro GET /api/user-space:", error);
        return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
    }
}

// --- MÉTODO POST: Salva a nova ordem da sidebar quando o usuário arrasta ---
export async function POST(req: Request) {
    try {
        // 1. Autenticação e body
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
        }

        const body = await req.json();
        const { layoutState } = body; // O frontend envia: { layoutState: { sidebarOrder: [...] } }

        if (!layoutState) {
            return NextResponse.json({ error: 'Nenhum dado de layout enviado.' }, { status: 400 });
        }

        // 2. Localiza o usuário real
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        // 3. Merge Inteligente do JSON (Para não apagar o estado da Agenda/Gadgets)
        const existingSpace = await prisma.userSpaceData.findUnique({
            where: { userId: user.id }
        });

        // Pega o estado atual do layout (se existir) e mescla com a nova ordem da sidebar
        const currentLayoutState = existingSpace?.layoutState && typeof existingSpace.layoutState === 'object'
            ? existingSpace.layoutState
            : {};

        const mergedLayoutState = {
            ...currentLayoutState, // Mantém coisas como { showYearBoard: true, gadgetOn: false }
            ...layoutState         // Adiciona/Atualiza { sidebarOrder: [...] }
        };

        // 4. Salva no banco de dados (Upsert: Cria se não existir, atualiza se existir)
        const updatedSpace = await prisma.userSpaceData.upsert({
            where: { userId: user.id },
            update: {
                layoutState: mergedLayoutState
            },
            create: {
                userId: user.id,
                layoutState: mergedLayoutState
            }
        });

        return NextResponse.json({ success: true, data: updatedSpace });

    } catch (error: any) {
        console.error("❌ Erro POST /api/user-space:", error);
        return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
    }
}