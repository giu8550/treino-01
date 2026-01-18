import { NextResponse } from "next/server";
// Ajuste os imports conforme a sua estrutura de pastas real
// Se der erro, tente "../../../src/lib/prisma"
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: Request) {
    console.log("--- GET FEED REQUEST ---");

    const session = await getServerSession(authOptions);
    const currentUserEmail = session?.user?.email || "";

    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                comments: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        // Mapeamento dos dados (O erro de sintaxe costuma estar aqui)
        const formattedPosts = posts.map((post: any) => ({
            id: post.id,
            user: post.user,
            content: post.content,
            time: new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            likes: post.likes.length,
            isLiked: post.likes.includes(currentUserEmail),
            commentsList: post.comments.map((c: any) => ({
                id: c.id,
                user: c.user,
                content: c.content,
                time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error("Erro no Prisma:", error);
        return NextResponse.json({ error: "Erro ao carregar feed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    console.log("--- POST NEW MESSAGE ---");
    const session = await getServerSession(authOptions);

    // Modo Debug: Se não tiver sessão, usa "Agente Convidado" para não travar o teste
    // Depois voltamos para o bloqueio de segurança
    const userName = session?.user?.name || "Agente Convidado";

    try {
        const { content } = await req.json();

        const newPost = await prisma.post.create({
            data: {
                user: userName,
                content: content,
                likes: []
            }
        });

        console.log("✅ Post salvo:", newPost.id);
        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Erro ao criar post:", error);
        return NextResponse.json({ error: "Erro ao postar" }, { status: 500 });
    }
}