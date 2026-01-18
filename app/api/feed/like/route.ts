import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Precisa estar logado" }, { status: 401 });
    }

    const userEmail = session.user.email;

    try {
        const { postId } = await req.json();

        // 1. Busca o post atual para ver os likes
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { likes: true }
        });

        if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

        // 2. Verifica se o usuário já deu like
        const isLiked = post.likes.includes(userEmail);

        // 3. Atualiza o array (Adiciona ou Remove)
        const updatedLikes = isLiked
            ? post.likes.filter((email) => email !== userEmail) // Remove
            : [...post.likes, userEmail]; // Adiciona

        // 4. Salva no banco
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { likes: updatedLikes }
        });

        return NextResponse.json({
            likes: updatedLikes.length,
            isLiked: !isLiked
        });

    } catch (error) {
        return NextResponse.json({ error: "Erro ao dar like" }, { status: 500 });
    }
}