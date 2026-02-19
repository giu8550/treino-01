// 1. FORÇA A ROTA A SER DINÂMICA (Resolve o erro da Vercel)
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma'; // Certifique-se de que este é o caminho correto para o seu cliente Prisma

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // userId recebido do frontend (geralmente enviamos session.user.email)
        const { 
            userId, 
            schedule, 
            stickyNote, 
            chatHistory, 
            zaeonChat, 
            library, 
            personalModules, 
            layoutState 
        } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Usuário não identificado' }, { status: 400 });
        }

        // 1. Busca o usuário no banco para pegar o ObjectID real
        // Como o NextAuth geralmente devolve o email, buscamos por ele primeiro.
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: userId },
                    { id: userId } // Caso o frontend já mande o ID direto
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado no banco de dados' }, { status: 404 });
        }

        // 2. Upsert: Atualiza se existir, cria se não existir usando o modelo UserSpaceData
        const workspace = await prisma.userSpaceData.upsert({
            where: { userId: user.id },
            update: {
                schedule,
                stickyNote,
                chatHistory,
                zaeonChat,
                library,
                personalModules,
                layoutState
            },
            create: {
                userId: user.id,
                schedule,
                stickyNote,
                chatHistory,
                zaeonChat,
                library,
                personalModules,
                layoutState
            }
        });

        return NextResponse.json({ success: true, data: workspace });

    } catch (error: any) {
        console.error("❌ Erro Prisma POST:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 });
        }

        // Busca o usuário para pegar o ID correto
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: userId },
                    { id: userId }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Busca os dados do espaço do usuário
        const workspace = await prisma.userSpaceData.findUnique({
            where: { userId: user.id }
        });

        // Se não tiver nada salvo, retorna um objeto padrão limpo para o frontend não quebrar
        if (!workspace) {
            return NextResponse.json({
                data: {
                    schedule: [],
                    stickyNote: "",
                    chatHistory: [{ role: 'ai', text: "System online. I manage your schedule." }],
                    zaeonChat: [{ role: 'agent', text: "Zaeon initialized. Ready." }],
                    library: [],
                    personalModules: [
                        { id: 1, title: "Personal Backpack", items: [] },
                        { id: 2, title: "Project Archives", items: [] }
                    ],
                    layoutState: null
                }
            });
        }

        return NextResponse.json({ data: workspace });

    } catch (error: any) {
        console.error("❌ Erro Prisma GET:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}