import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Certifique-se que o prisma client está exportado daqui
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Sua configuração do NextAuth

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const currentUserEmail = session?.user?.email || "";

    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                comments: {
                    orderBy: { createdAt: 'asc' } // Comentários em ordem cronológica
                }
            }
        });

        // Mapeia para o formato que o Frontend espera
        const formattedPosts = posts.map(post => ({
            id: post.id,
            user: post.user,
            content: post.content,
            time: new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Ex: 14:30
            likes: post.likes.length,
            isLiked: post.likes.includes(currentUserEmail),
            commentsList: post.comments.map(c => ({
                id: c.id,
                user: c.user,
                content: c.content,
                time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao carregar feed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { content } = await req.json();

        const newPost = await prisma.post.create({
            data: {
                user: session.user?.name || "Agente Zaeon",
                content: content,
                likes: []
            }
        });

        return NextResponse.json(newPost);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao postar" }, { status: 500 });
    }
}