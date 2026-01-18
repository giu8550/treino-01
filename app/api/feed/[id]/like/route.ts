import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.email;
    const postId = params.id;

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        const isLiked = post.likes.includes(userId);

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                likes: isLiked
                    ? { set: post.likes.filter((email) => email !== userId) } // Remove like
                    : { push: userId } // Adiciona like
            }
        });

        return NextResponse.json({ success: true, likes: updatedPost.likes.length });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao processar like" }, { status: 500 });
    }
}