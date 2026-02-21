import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do Prisma em desenvolvimento
const prisma = new PrismaClient();

// 1. GET: Busca todas as notícias para preencher a lista lateral
export async function GET() {
    try {
        const posts = await prisma.newsPost.findMany({
            orderBy: { publishDate: 'desc' }
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Erro GET News:", error);
        return NextResponse.json({ error: "Falha ao buscar notícias" }, { status: 500 });
    }
}

// 2. POST: Cria (se não tiver ID) ou Atualiza (se tiver ID)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        // A categoria foi adicionada aqui na desestruturação
        const { id, title, subtitle, content, imageUrl, publishDate, status, category } = body;

        // Converte a string de data (2026-02-06) para Objeto Date do JS
        const dateObject = new Date(publishDate);

        // VERIFICAÇÃO: Se tem ID e não é um ID temporário criado pelo frontend
        if (id && id.length > 10 && !id.startsWith("temp_")) {
            // --- ATUALIZAR (UPDATE) ---
            const updatedPost = await prisma.newsPost.update({
                where: { id },
                data: {
                    title, subtitle, content, imageUrl, status, category,
                    publishDate: dateObject
                }
            });
            return NextResponse.json(updatedPost);
        } else {
            // --- CRIAR NOVO (CREATE) ---
            const newPost = await prisma.newsPost.create({
                data: {
                    title, subtitle, content, imageUrl, status, category,
                    publishDate: dateObject
                }
            });
            return NextResponse.json(newPost);
        }

    } catch (error) {
        console.error("Erro POST News:", error);
        return NextResponse.json({ error: "Falha ao salvar notícia" }, { status: 500 });
    }
}

// 3. DELETE: Apaga a notícia
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

        await prisma.newsPost.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
    }
}