import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { postId, content } = await req.json();

        // O Prisma usa 'postId' para relacionar, mas verifique se o campo no seu schema
        // é exatamente postId ou se é uma relação direta.
        const newComment = await prisma.comment.create({
            data: {
                content,
                user: session.user?.name || "Agente Zaeon",
                post: {
                    connect: { id: postId } // Forma mais segura do Prisma conectar relações
                }
            }
        });

        return NextResponse.json(newComment);
    } catch (error) {
        console.error("Erro ao comentar:", error);
        return NextResponse.json({ error: "Erro ao comentar" }, { status: 500 });
    }
}