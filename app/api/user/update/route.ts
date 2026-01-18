import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth"; // <--- Importando da lib, igual ao outro

export async function POST(req: Request) {
    // Pergunta pra lib: "Esse cara tá logado?"
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const course = formData.get("course") as string;
        const imageFile = formData.get("image") as File | null;

        const dataToUpdate: any = {};

        if (name && name.trim() !== "") dataToUpdate.name = name;
        if (course) dataToUpdate.course = course;

        // Processamento da Imagem
        if (imageFile) {
            if (imageFile.size > 4 * 1024 * 1024) {
                return NextResponse.json({ error: "Imagem muito grande (Max 4MB)" }, { status: 400 });
            }
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            dataToUpdate.image = base64Image;
        }

        // Salva no Banco (Upsert = Cria se não existir, Atualiza se existir)
        const updatedUser = await prisma.user.upsert({
            where: {
                email: session.user.email,
            },
            update: dataToUpdate,
            create: {
                email: session.user.email,
                name: name || session.user.name,
                image: dataToUpdate.image || session.user.image,
                course: course || "",
                kycStatus: "pending"
            },
        });

        console.log("✅ Perfil salvo:", updatedUser.email);

        return NextResponse.json({
            success: true,
            user: {
                name: updatedUser.name,
                image: updatedUser.image,
                course: updatedUser.course
            }
        });

    } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        return NextResponse.json({ error: "Erro interno ao salvar" }, { status: 500 });
    }
}