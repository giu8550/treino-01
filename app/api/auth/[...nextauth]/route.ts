import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth"; // Puxa a receita da lib

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };