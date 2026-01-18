import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { content } = await req.json();

        const newComment = await prisma.comment.create({
            data: {
                content,
                user: session.user?.name || "Agente Zaeon",
                postId: params.id
            }
        });

        return NextResponse.json(newComment);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao comentar" }, { status: 500 });
    }
}