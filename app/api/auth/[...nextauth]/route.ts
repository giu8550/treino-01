import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                // @ts-ignore
                session.user.id = token.sub;

                // --- DEFINIÇÃO DE ADMIN ---
                // Se o e-mail logado for o seu, injetamos a flag isAdmin na sessão
                // @ts-ignore
                session.user.isAdmin = session.user.email === "donmartinezcaiudoceu@gmail.com";
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };