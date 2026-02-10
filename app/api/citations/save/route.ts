import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/src/lib/auth"; 
import { prisma } from "@/src/lib/prisma"; 

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { citation, userId: bodyUserId } = await req.json();

        // Auth Fallback Logic
        const user = session?.user as any;
        const targetUserId = user?.id || bodyUserId;

        if (!targetUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch existing data to append the new citation
        const currentData = await prisma.userSpaceData.findUnique({
            where: { userId: targetUserId }
        }) as any;

        let existingCitations = currentData?.citations || [];
        
        // Ensure it's an array
        if (!Array.isArray(existingCitations)) {
            existingCitations = [];
        }

        // 2. Add new citation with timestamp
        const newEntry = {
            content: citation,
            savedAt: new Date().toISOString()
        };

        const updatedList = [newEntry, ...existingCitations];

        // 3. Save back to DB
        await prisma.userSpaceData.upsert({
            where: { userId: targetUserId }, 
            update: { 
                citations: updatedList 
            } as any, 
            create: { 
                userId: targetUserId, 
                citations: updatedList 
            } as any 
        });

        return NextResponse.json({ success: true, count: updatedList.length });

    } catch (error: any) {
        console.error("Citation Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}