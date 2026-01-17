import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { cookies } from "next/headers";
import { MongoClient } from "mongodb";
import { clientPromise } from "@/src/lib/db";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],

    session: {
        strategy: "jwt",
    },

    events: {
        async createUser({ user }) {
            try {
                const cookieStore = cookies();
                const intentCookie = cookieStore.get("zaeon_intent");

                if (intentCookie) {
                    const data = JSON.parse(decodeURIComponent(intentCookie.value));

                    const client = (await clientPromise) as MongoClient;
                    const db = client.db();

                    await db.collection("users").updateOne(
                        { email: user.email },
                        {
                            $set: {
                                role: data.role || "student",
                                phone: data.phone || "",
                                identityId: data.idValue || "",
                                identityType: data.idType || "",
                                institution: "",
                                documents: [],
                                kycStatus: "pending",
                                createdAt: new Date()
                            }
                        }
                    );
                    console.log(`[ZAEON AUTH] User ${user.email} updated via Cookie Intent with role: ${data.role}`);
                }
            } catch (error) {
                console.error("[ZAEON AUTH] Error in createUser event:", error);
            }
        }
    },

    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                // @ts-ignore
                session.user.id = token.sub;

                // --- ADMIN CHECK ---
                // @ts-ignore
                session.user.isAdmin = session.user.email === "donmartinezcaiudoceu@gmail.com";

                // --- ROLE SYNC ---
                // O MongoDB Adapter joga o role para o 'user' no callback JWT inicial,
                // que por sua vez passa para o 'token'. Aqui passamos para a 'session'.
                // @ts-ignore
                session.user.role = token.role || "student";
            }
            return session;
        },

        async jwt({ token, user, trigger, session }) {
            // No primeiro login, 'user' contém os dados do banco (Adapter)
            if (user) {
                // @ts-ignore
                token.role = user.role;
            }

            // Permite atualizar a sessão no frontend sem relogar (ex: update manual)
            if (trigger === "update" && session?.role) {
                token.role = session.role;
            }
            return token;
        }
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };